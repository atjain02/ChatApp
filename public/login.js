const QueryString = window.location.search
const urlParams = new URLSearchParams(QueryString)
const errorDiv = document.getElementById("error");
if (urlParams.has("username")) {
    let username = urlParams.get("username")
    errorDiv.innerHTML = `The username ${username} is already in the chat. Please choose a different username.`
} else {
    errorDiv.innerHTML = ""
}
