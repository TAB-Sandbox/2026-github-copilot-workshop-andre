<template>
  <div class="layout">
    <header class="navbar">
      <span class="navbar-brand">Procurement MVP</span>
      <nav>
        <RouterLink to="/" :class="{ active: isDashboard }">Dashboard</RouterLink>
        <RouterLink to="/requisitions" :class="{ active: isRequisitions }">Purchase Requisitions</RouterLink>
      </nav>
      <button
        type="button"
        class="theme-toggle"
        :title="themeToggleTitle"
        aria-label="Toggle dark mode"
        @click="toggleTheme"
      >
        <svg v-if="isDark" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3V5M12 19V21M5 12H3M21 12H19M6.34 6.34L4.93 4.93M19.07 19.07L17.66 17.66M6.34 17.66L4.93 19.07M19.07 4.93L17.66 6.34M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 12.79C20.8427 14.4922 20.2039 16.1144 19.1582 17.4668C18.1126 18.8192 16.7035 19.8458 15.0957 20.4263C13.4879 21.0068 11.7481 21.1181 10.0805 20.7463C8.41293 20.3744 6.88832 19.5345 5.67885 18.3251C4.46939 17.1156 3.62949 15.591 3.25765 13.9234C2.88582 12.2559 2.99713 10.5161 3.57763 8.90832C4.15812 7.30052 5.18472 5.89141 6.53711 4.84575C7.8895 3.80009 9.51171 3.16131 11.2139 3.00396C10.6226 4.47958 10.5518 6.12348 11.0134 7.64471C11.4751 9.16595 12.4408 10.4781 13.7612 11.4017C15.0816 12.3253 16.6827 12.8074 18.3189 12.7753C19.216 12.758 20.1014 12.6148 21 12.79Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </header>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import { useTheme } from './composables/useTheme.js';

const route = useRoute();
const { theme, isDark, init: initTheme, toggle: toggleTheme } = useTheme();

const isDashboard = computed(() => route.path === '/');
const isRequisitions = computed(() => route.path.startsWith('/requisitions'));
const themeToggleTitle = computed(() => (isDark.value ? 'Switch to light mode' : 'Switch to dark mode'));

onMounted(() => {
  initTheme();
});
</script>
