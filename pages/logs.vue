<script setup lang="ts">
import LogsBreadcrumb from "~/components/molecules/breadcrumbs/LogsBreadcrumb.vue";
import LogPage from "~/components/organisms/LogPage.vue";
</script>

<template>
  <div>
    <LogsBreadcrumb />
    <h2 class="text-2xl mb-2 font-semibold">Logs</h2>
    <LogPage />
  </div>
</template>
