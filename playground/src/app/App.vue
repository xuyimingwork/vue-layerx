<script setup lang="ts">
import { demoGroups } from '../demos/catalog'
import PlaygroundShell from '../ui/PlaygroundShell.vue'
</script>

<template>
  <PlaygroundShell :groups="demoGroups" />
</template>
