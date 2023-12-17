import { displayPost ,baseUrl} from "./function/post.js";
/**
 * Fetches data from the Hacker News API and displays the stories, jobs, and polls on the webpage.
 * Uses infinite scroll to load more data when the user reaches the bottom of the page.
 * Automatically refreshes the data every 5 seconds when the user scrolls to the top of the page.
 */

let currentPage = 1;
let currentSection = 'newstories'
let maxItem = 0;

/**
 * Throttles a function to limit the rate at which it is called.
 * @param {Function} f - The function to be throttled.
 * @param {number} delay - The delay in milliseconds between function calls.
 * @param {Object} options - The options for throttling.
 * @param {boolean} options.leading - Whether to allow the leading function call.
 * @param {boolean} options.trailing - Whether to allow the trailing function call.
 * @returns {Function} - The throttled function.
 */
const throttle = (f, delay, { leading = false, trailing = false } = {}) => {
    let flag = false
    return (...args) => {
        if (!flag) {
            if (leading) f(...args)
            flag = true
            setTimeout(() => {
                flag = false
                if (trailing && !(leading)) f(...args)
            }, delay)
        }
    }
}
let pageStoryIds = [];
/**
 * Fetches the data from the Hacker News API.
 * @returns {Promise} - A promise that resolves with the fetched data.
*/
const fetchData = async () => {
    document.getElementById('showMore').style.display = ''
    document.getElementById('getLastUpdates').style.display = ''
    let flag = 0;
    if (currentSection == "polls"){
        flag=1; 
        document.getElementById('showMore').style.display = 'none'
        document.getElementById('getLastUpdates').style.display = 'none'
    } 
    // fetch(`${baseUrl}newstories.json`)
    fetch(`${baseUrl}${currentSection}.json`)
        .then(response => response.json())
        .then(storyIds => {
            maxItem = storyIds[0]
            // console.log("test");
            const startIndex = (currentPage - 1) * 10;
            const endIndex = currentPage * 10;
            if (flag == 0){
                pageStoryIds = storyIds.slice(startIndex, endIndex);
            } else {
                pageStoryIds = [160704, 126809]
            }
            // Fetch details of each story, job, and poll
            const itemPromises = pageStoryIds.map(itemId =>
                fetch(`${baseUrl}item/${itemId}.json`).then(response => response.json())
            );

            // Wait for all item details to be fetched
            return Promise.all(itemPromises);
        })
        .then(items => {
            const stories = items.filter(item => item.type === 'story');
            const jobs = items.filter(item => item.type === 'job');
            const polls = items.filter(item => item.type === 'poll');
            const section = document.createElement('section')
            section.id = 'section'

            stories.forEach(async story => {
                section.appendChild(await displayPost(story))
            });

            jobs.forEach(async job => {
                section.appendChild(await displayPost(job))
            });

            polls.forEach(async poll => {
                section.appendChild(await displayPost(poll))
            });

            document.body.appendChild(section);
        })
        .catch(error => {
            console.error('Error:', error);
        });
        
}



const loadMoreData = throttle(async () => {
    currentPage++;
    await fetchData();
}, 200, { trailing: true });


const refreshData = throttle(async () => {
    currentPage = 1;
    location.reload();
}, 5000, { leading: true, trailing: false })


const loadMoreBtn = throttle(async () => {
    currentPage++;
    await fetchData();
}, 5000, { leading: true, trailing: false });

/**
 * Scroll listener for infinite scroll and refresh on scroll to top.
 */
window.addEventListener('scroll', () => {
    if (currentSection != 'polls'){
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 5) {
            currentPage++;
            loadMoreData()
        }
    }
});

const sectionBtn = document.getElementById('sectionBtn');
sectionBtn.addEventListener('change', async (e) => {
    currentSection = sectionBtn.value;
    currentPage = 1;
    let section = document.querySelectorAll('#section');
    section.forEach(element=> {
        element.remove()
    })
    await fetchData()
})

const showMore = document.getElementById('showMore')
showMore.addEventListener('click', () => {
    if (currentSection != 'polls'){
    currentPage++;
    loadMoreBtn()
    }
})


function originUpdatesTracker() {
    let btn = document.getElementById('getLastUpdates')

    btn.addEventListener('click', () => {
        refreshData()
    })
    
    setInterval(() => {
    if (currentSection != 'polls') fetch(`${baseUrl}${currentSection}.json`)
    .then(resp => resp.json())
    .then(v => {
        let inbetween = v.indexOf(maxItem)
        
        if (inbetween > 0) {
            console.log('Update spotted');
            btn.innerHTML = `${inbetween} posts pending`
        }
    })}, 5000)
}
fetchData();// Fetch data initially

originUpdatesTracker();// Checks for new posts since last fetch