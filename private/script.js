;(function useRepositoryNameForTitle() {
  const locations = Array.from(
    document.getElementsByClassName("location")
  )

  let { protocol, hostname, pathname } = location
  const isLocal = (/(^[0-9.]*$)|localhost/.test(hostname))

  if (protocol === "file:" || isLocal) {
    // pathname is "/path/to/REPOSITORY-NAME/docs/index.html"
    hostname = pathname.split("/").slice(-3)[0]
  } else {
    // Trim off `.github.io`
    hostname = hostname.replace(/\..*$/, "")
  }

  locations.forEach( location => location.innerHTML = hostname)
})()



;(async function generateTutorialLinksFromJSON(){
  const ul = document.getElementById("tutorials")
  const URL = "private/tutorials.json"
  let tutorials = []

  try {
    const response = await fetch(URL)
    tutorials = await response.json()
    displayTutorials(tutorials)

  } catch (error) {
    // No JSON available
    const li = document.createElement("li")
    li.innerText = "Provide links to your tutorials here"
    ul.append(li)
  }

  function displayTutorials(tutorials) {
    const replace = document.getElementById("replace")
    replace.innerHTML = "Replace the placeholder links below with working links to your own tutorials.<br><br>See <code>docs/assets/tutorials.json</code> for inspiration."
    tutorials.forEach(({ name, url, description, icon }) => {
      const li = document.createElement("li")
      const a = document.createElement("a")
      const div = document.createElement("div")
      const h3 = document.createElement("h3")
      const img = document.createElement("img")
      const span = document.createElement("span")

      a.href = url
      img.src = icon
      img.alt = icon.replace(/\..*$/, "")

      h3.innerText = name
      span.innerText = description

      div.append(h3)
      div.append(span)

      a.append(img)
      a.append(div)

      li.append(a)
      ul.append(li)
    })
  }
})()