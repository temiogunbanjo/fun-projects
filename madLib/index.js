document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("story-form");
  const storyBoard = document.querySelector("#story-form > p");

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    // alert("Submitted");
    console.log(form.elements);
    const title = form.elements["title"].value;
    const fullName = form.elements["name"].value;
    const animalFriend = form.elements["animal-friend"].value;

    storyBoard.innerHTML = `<span class="type">
    <em>${title + " " + fullName}</em> and <em>${animalFriend}</em> were good friends. 
    In the summer, <em>${title + " " + fullName}</em> works hard to fill his storage with 
    food. While <em>${animalFriend}</em> was enjoying the fine weather and playing all day. 

    When winter came, <em>${title + " " + fullName}</em> was lying cozily in his home, surrounded 
    by the food he stored during the summer. While <em>${animalFriend}</em> was in his home, hungry and 
    freezing. He asked <em>${title + " " + fullName}</em> for food, and <em>${title + " " + fullName}</em> 
    gave him some. But it wasn't enough to last the entire winter. When he tried to ask 
    <em>${title + " " + fullName}</em> again, the latter replied: “I'm sorry my friend but my food 
    is just enough for my family to last until the end of winter. If I give you more, we too will 
    starve. We had the entire summer to prepare for the winter but you chose to play instead.”
  </span>`;
  });
});
