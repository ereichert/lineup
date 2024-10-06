<script setup lang="ts">
// import { RouterLink, RouterView } from 'vue-router'
// import HelloWorld from './components/HelloWorld.vue'
import BattingLineup from './components/BattingLineup.vue'
</script>

<template>
  <header>
    <!-- <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div> -->
  </header>

  <body>
    <div class="container">
      <div class="column">
        <h2>Batting Lineup</h2>
        <BattingLineup></BattingLineup>
      </div>
      <div class="column">
        <h2>Fielding Lineup</h2>
        <div class="grid">
          <div class="grid-row inning-header">
            <div class="grid-cell">Position</div>
            <div class="grid-cell">Inning 1</div>
            <div class="grid-cell">Inning 2</div>
            <div class="grid-cell">Inning 3</div>
            <div class="grid-cell">Inning 4</div>
            <div class="grid-cell">Inning 5</div>
            <div class="grid-cell">Inning 6</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell position-header">Catcher</div>
            <div class="grid-cell">Row 1, Cell 1</div>
            <div class="grid-cell">Row 1, Cell 2</div>
            <div class="grid-cell">Row 1, Cell 3</div>
            <div class="grid-cell">Row 1, Cell 4</div>
            <div class="grid-cell">Row 1, Cell 5</div>
            <div class="grid-cell">Row 1, Cell 6</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell position-header">First Base</div>
            <div class="grid-cell">Row 2, Cell 1</div>
            <div class="grid-cell">Row 2, Cell 2</div>
            <div class="grid-cell">Row 2, Cell 3</div>
            <div class="grid-cell">Row 2, Cell 4</div>
            <div class="grid-cell">Row 2, Cell 5</div>
            <div class="grid-cell">Row 2, Cell 6</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell position-header">Second Base</div>
            <div class="grid-cell">Row 3, Cell 1</div>
            <div class="grid-cell">Row 3, Cell 2</div>
            <div class="grid-cell">Row 3, Cell 3</div>
            <div class="grid-cell">Row 3, Cell 4</div>
            <div class="grid-cell">Row 3, Cell 5</div>
            <div class="grid-cell">Row 3, Cell 6</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell position-header">Shortstop</div>
            <div class="grid-cell">Row 4, Cell 1</div>
            <div class="grid-cell">Row 4, Cell 2</div>
            <div class="grid-cell">Row 4, Cell 3</div>
            <div class="grid-cell">Row 4, Cell 4</div>
            <div class="grid-cell">Row 4, Cell 5</div>
            <div class="grid-cell">Row 4, Cell 6</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell position-header">Third Base</div>
            <div class="grid-cell">Row 5, Cell 1</div>
            <div class="grid-cell">Row 5, Cell 2</div>
            <div class="grid-cell">Row 5, Cell 3</div>
            <div class="grid-cell">Row 5, Cell 4</div>
            <div class="grid-cell">Row 5, Cell 5</div>
            <div class="grid-cell">Row 5, Cell 6</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell position-header">Left Field</div>
            <div class="grid-cell">Row 6, Cell 1</div>
            <div class="grid-cell">Row 6, Cell 2</div>
            <div class="grid-cell">Row 6, Cell 3</div>
            <div class="grid-cell">Row 6, Cell 4</div>
            <div class="grid-cell">Row 6, Cell 5</div>
            <div class="grid-cell">Row 6, Cell 6</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell position-header">Center Field</div>
            <div class="grid-cell">Row 7, Cell 1</div>
            <div class="grid-cell">Row 7, Cell 2</div>
            <div class="grid-cell">Row 7, Cell 3</div>
            <div class="grid-cell">Row 7, Cell 4</div>
            <div class="grid-cell">Row 7, Cell 5</div>
            <div class="grid-cell">Row 7, Cell 6</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell position-header">Right Field</div>
            <div class="grid-cell">Row 8, Cell 1</div>
            <div class="grid-cell">Row 8, Cell 2</div>
            <div class="grid-cell">Row 8, Cell 3</div>
            <div class="grid-cell">Row 8, Cell 4</div>
            <div class="grid-cell">Row 8, Cell 5</div>
            <div class="grid-cell">Row 8, Cell 6</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell position-header">Bench</div>
            <div class="grid-cell">Row 9, Cell 1</div>
            <div class="grid-cell">Row 9, Cell 2</div>
            <div class="grid-cell">Row 9, Cell 3</div>
            <div class="grid-cell">Row 9, Cell 4</div>
            <div class="grid-cell">Row 9, Cell 5</div>
            <div class="grid-cell">Row 9, Cell 6</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell position-header">Bench</div>
            <div class="grid-cell">Row 10, Cell 1</div>
            <div class="grid-cell">Row 10, Cell 2</div>
            <div class="grid-cell">Row 10, Cell 3</div>
            <div class="grid-cell">Row 10, Cell 4</div>
            <div class="grid-cell">Row 10, Cell 5</div>
            <div class="grid-cell">Row 10, Cell 6</div>
          </div>
        </div>
      </div>
    </div>
  </body>

  <!-- <RouterView /> -->
</template>

<style scoped>
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
}

.container {
  display: flex;
  gap: 20px;
}

.column {
  flex: 1;
}

select {
  width: 100%;
  margin-bottom: 10px;
  padding: 5px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  border: 1px solid #ddd;
}

.grid-row {
  display: contents;
}

.grid-cell {
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.inning-header .grid-cell,
.position-header {
  background-color: #f2f2f2;
  font-weight: bold;
}

/* header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
} */
</style>
