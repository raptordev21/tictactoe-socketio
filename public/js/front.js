const errorDiv = document.getElementById('error')

// Get username and room from URL
const urlSearchParams = new URLSearchParams(window.location.search)
const { error } = Object.fromEntries(urlSearchParams.entries())

if (error === undefined) {
    errorDiv.innerHTML = ''
} else {
    errorDiv.innerHTML = error
}
