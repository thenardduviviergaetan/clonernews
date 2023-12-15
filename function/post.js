export const baseUrl = 'https://hacker-news.firebaseio.com/v0/';


function newSpan(str, ...cl) {
    let tr = document.createElement("span")
    cl.forEach((element) => tr.classList.add(element))
    tr.innerHTML = str + '<br>'
    return tr
}

/**
 * Fetches the time difference between the current time and a given timestamp.
 * @param {number} element - The timestamp to calculate the time difference from.
 * @returns {string} - The formatted time difference string.
 */
const fetchTime =  (element) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const postTime = currentTime - element;

    let timeString;
    if (postTime < 60) {
        timeString = `${postTime} seconds ago`;
    } else if (postTime < 3600) {
        const minutes = Math.floor(postTime / 60);
        timeString = `${minutes} minutes ago`;
    } else if (postTime < 86400) {
        const hours = Math.floor(postTime / 3600);
        timeString = `${hours} hours ago`;
    } else {
        const days = Math.floor(postTime / 86400);
        timeString = `${days} days ago`;
    }
    return timeString
}

async function data(str) {
    let response = await fetch(str)
    return await response.json()
}
class Post {
    constructor(post) {
        this.id = post.id
        this.author = post.by
        this.time = post.time
        this.title = post.title
        this.type = post.type
        this.text = post.text
        this.url = post.url
        this.tabs_Kids = post.kids
        this.tabs_Comment = []
        this.score = `scores : ${post.score}`
    }
    fetch_Post_Kids() {
        const fetchPromises = this.tabs_Kids.map(async (element) => {
            let comment = new Comment(await data(baseUrl + `item/${element}.json`));
            this.tabs_Comment.push(comment);
        });
        return Promise.all(fetchPromises);
    }
    html() {
        let post = document.createElement("div");
        post.id = this.id;
        post.classList.add("post");
        let author = document.createElement("p")
        author.textContent = `by ${this.author}`
        author.classList.add('by')
        if (this.url) {
            let href = document.createElement("a")
            href.href = this.url
            href.target = 'blank'
            href.classList.add('postTitle')
            let br = document.createElement('br')
            post.appendChild(br)
            if (this.title) href.appendChild(newSpan(this.title))
            post.appendChild(href)
        } else {
            if (this.title) post.appendChild(newSpan(this.title))
        }

        post.appendChild(author)
        post.appendChild(newSpan(this.score,"score"))
        if (this.text) post.appendChild(newSpan(this.text, "text"))
        let divComment = document.createElement("div")
        let nbcomment = newSpan(this.tabs_Kids ? `Comment (${this.tabs_Kids.length}):` : `Comment (0): <br>`)
        divComment.appendChild(nbcomment)
        if (typeof this.tabs_Kids !== 'undefined') {
            Promise.all([this.fetch_Post_Kids()]).then(() => {
                this.tabs_Comment.forEach((element) => {
                    divComment.appendChild(element.html());
                });
            });
        }
        nbcomment.addEventListener("click", () => {
            console.log(divComment)
            for (let child of divComment.children) {
                if (divComment.firstChild != child) {
                    child.style.display == "" ? child.style.display = "none" : child.style.display = ""
                }
            }
        })
        let time = document.createElement("div")
        time.classList.add("time")
        time.appendChild(newSpan(`${fetchTime(this.time)}`))
        post.appendChild(time)
        post.appendChild(divComment)
        return post
    }
}
class Comment {
    constructor(comment) {
        this.id = comment.id
        this.author = comment.by
        this.time = comment.time
        this.text = comment.text
        this.tabs_Kids = comment.kids
        this.death = comment.dead
        this.tabs_Comment = []
    }
    fetch_Comment_Kids() {
        const fetchPromises = this.tabs_Kids.map(async element => {
            let comment = new Comment(await data(baseUrl + `item/${element}.json`))
            this.tabs_Comment.push(comment)
        });
        return Promise.all(fetchPromises)
    }
    html() {
        let comment = document.createElement("div")
        comment.id = this.id
        comment.classList.add("comment")
        comment.style.display = "none"
        let author = document.createElement("p")
        author.id = "by"
        author.appendChild(newSpan(this.author + " :", "author"))
        comment.appendChild(author)
        if (this.text) comment.appendChild(newSpan(this.text + '<br><br>', "text"))
        if (this.death) comment.appendChild(newSpan("delete", "delete"))
        if (this.death) comment.classList.add("delete")
        let divComment = document.createElement("div")
        let nbcomment = newSpan(this.tabs_Kids ? `Comment (${this.tabs_Kids.length}):` : `Comment (0):`)
        divComment.appendChild(nbcomment)
        if (typeof this.tabs_Kids !== 'undefined') {
            Promise.all([this.fetch_Comment_Kids()]).then(() => {
                this.tabs_Comment.forEach(element => {
                    divComment.appendChild(element.html())
                });
            });
        }
        nbcomment.addEventListener("click", () => {
            console.log(divComment)
            for (let child of divComment.children) {
                if (divComment.firstChild != child) {
                    child.style.display == "" ? child.style.display = "none" : child.style.display = ""
                }
            }
        })
        let time = document.createElement("div")
        time.classList.add("time")
        time.appendChild(newSpan(`${fetchTime(this.time)}`))
        comment.appendChild(time)
        comment.appendChild(divComment)
        return comment
    }
}

export async function displayPost(postData) {
    let post = new Post(postData)    
    return post.html()
}