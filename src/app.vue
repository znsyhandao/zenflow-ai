<template>
  <div id="app">
    <header>
      <h1>🧘‍♂️ ZenFlow AI</h1>
      <p>智能冥想系统</p>
    </header>
    <main>
      <div class="feature">
        <h2>功能特点</h2>
        <ul>
          <li>脑波音乐</li>
          <li>冥想指导</li>
          <li>睡眠辅助</li>
          <li>专注训练</li>
        </ul>
        <button @click="startMeditation">开始冥想</button>
      </div>
    </main>
  </div>
</template>

<script setup>
const startMeditation = () => {
  alert("开始冥想体验...")
}
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
header {
  text-align: center;
  margin-bottom: 40px;
}
h1 {
  color: #6366f1;
}
.feature {
  background: #f8fafc;
  padding: 20px;
  border-radius: 10px;
}
button {
  background: #6366f1;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
}
</style>
