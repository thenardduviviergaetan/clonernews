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
        this.score = `Score: ${post.score}`
    }
    async fetchPostKids() {
        const fetchPromises = this.tabs_Kids.map(async (element) => {
            let response = await fetch(baseUrl + `item/${element}.json`)
            let comment = new Comment(await response.json())
            this.tabs_Comment.push(comment)
        });
        await Promise.all(fetchPromises)
        this.tabs_Comment.sort((a, b) => b.time - a.time) // Sort comments by time
    }
    html() {
        let post = document.createElement("div");
        post.id = this.id;
        post.classList.add("post");
        let author = document.createElement("p")
        author.innerHTML = `by ${this.author}`
        author.classList.add('by')
        if (this.url) {
            let href = document.createElement("a");
            href.href = this.url;
            href.target = 'blank';
            href.classList.add('postTitle');
            if (this.title) {
                let item = document.createElement("p")
                item.classList.add("item")
                item.innerHTML = this.title;
                href.appendChild(item)
            }
            post.appendChild(href);
        } else {
            if (this.title) {
                let t = document.createElement("p")
                t.classList.add("title")
                t.innerHTML = this.title;
                post.appendChild(t)
            }
        }

        if (this.text) {
            let txt = document.createElement("p")
            txt.classList.add("item", "text")
            txt.innerHTML = this.text
            post.appendChild(txt)
        }

        if (this.type === "poll") {
            fetch(`https://hacker-news.firebaseio.com/v0/item/${this.id}.json?print=pretty`)
                .then(response => response.json())
                .then(poll => {
                    if (poll.parts) {
                        let optionsContainer = document.createElement("div");
                        optionsContainer.classList.add("pollOptionsContainer");
                        optionsContainer.style.display = "flex";
                        optionsContainer.style.flexWrap = "wrap";
                        optionsContainer.style.marginTop = "50px"; 
                        optionsContainer.style.justifyContent = "space-around"; 
                        poll.parts.forEach(async optionId => {
                            let optionResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${optionId}.json?print=pretty`);
                            let option = await optionResponse.json();
                            let optionElement = document.createElement("div");
                            optionElement.classList.add("pollOption");
                            let optionText = document.createElement("p");
                            optionText.innerHTML = option.text;
                            optionText.style.marginBottom = "20px";
                            let optionScore = document.createElement("p");
                            optionScore.innerHTML = `<strong>${option.score} votes</strong>`; 
                            optionElement.appendChild(optionText);
                            optionElement.appendChild(optionScore);
                            optionElement.style.width = `${100 / poll.parts.length}%`; 
                            optionElement.style.marginBottom = "50px"; 
                            optionsContainer.appendChild(optionElement);
                        });
                        post.insertBefore(optionsContainer, container);
                    }
                });
        }

        // let container = document.createElement("div");
        // container.classList.add("container");
        // let s = document.createElement("p");
        // s.classList.add("score");
        // s.innerHTML = this.score;
        // let divComment = document.createElement("div");
        // let nbcomment = document.createElement("p");
        // nbcomment.classList.add("commentBtn");
        // nbcomment.innerHTML = this.tabs_Kids ? `Comment (${this.tabs_Kids.length}):` : `Comment (0):`;
        // divComment.appendChild(nbcomment);

        // nbcomment.addEventListener("click", async () => {
        //     if (divComment.children.length === 1) {
        //         await this.fetchPostKids();
        //         this.tabs_Comment.forEach((element) => {
        //             let c = element.html()
        //             c.style.display = ""
        //             divComment.appendChild(c);
        //         });
        //     } else {
        //         for (let i = 1; i < divComment.children.length; i++) {
        //             divComment.children[i].style.display = divComment.children[i].style.display === "none" ? "" : "none";
        //         }
        //     }
        // });

        // let time = document.createElement("div");
        // time.classList.add("time");
        // let ti = document.createElement("p");
        // ti.classList.add("time");
        // ti.innerHTML = fetchTime(this.time);
        // time.appendChild(ti);
        // container.appendChild(author);
        // container.appendChild(s);
        // container.appendChild(time);
        // post.appendChild(container);
        // post.appendChild(divComment);
        
        let divComment = document.createElement("div")
        let nbcomment = newSpan(this.tabs_Kids ? `Comment (${this.tabs_Kids.length}):` : `Comment (0): <br>`)
        divComment.appendChild(nbcomment)
        if (typeof this.tabs_Kids !== 'undefined') {
            Promise.all([this.fetchPostKids()]).then(() => {
                this.tabs_Comment.forEach((element) => {
                    divComment.appendChild(element.html());
                });
            });
        }
        nbcomment.addEventListener("click", () => {
            // console.log(divComment)
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
        return post;
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