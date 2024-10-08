function setupListeners() {
  const storyBoard = document.querySelector("#story-form > p");
  const form = document.getElementById("story-form");

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    // alert("Submitted");
    console.log(form.elements);
    const title = form.elements["title"].value;
    const fullName = form.elements["name"].value;
    const animalFriend = form.elements["animal-friend"].value;

    storyBoard.innerHTML = `<span class="type">
    <em>${title.concat('.') + " " + fullName}</em> and <em>${animalFriend}</em> were good friends. 
    In the summer, <em>${title.concat('.') + " " + fullName}</em> works hard to fill his storage with 
    food. While <em>${animalFriend}</em> was enjoying the fine weather and playing all day. 
    <br/><br/>
    When winter came, <em>${title.concat('.') + " " + fullName}</em> was lying cozily in his home, surrounded 
    by the food he stored during the summer. While <em>${animalFriend}</em> was in his home, hungry and 
    freezing. He asked <em>${title.concat('.') + " " + fullName}</em> for food, and <em>${title.concat('.') + " " + fullName}</em> 
    gave him some. But it wasn't enough to last the entire winter. When he tried to ask 
    <em>${title.concat('.') + " " + fullName}</em> again, the latter replied: “I'm sorry my friend but my food 
    is just enough for my family to last until the end of winter. If I give you more, we too will 
    starve. We had the entire summer to prepare for the winter but you chose to play instead.”
  </span>`;
  });
}

function showSplashScreen() {
  const splashScreen = document.getElementById("splash");
  splashScreen.style.display = "flex";

  window.setTimeout(() => {
    document.querySelector("main").classList.toggle("not-started");
    splashScreen.style.display = "none";
    setupListeners();
  }, 8000);
}

function startGame(ev) {
  showSplashScreen();
}

document.addEventListener("DOMContentLoaded", startGame);
