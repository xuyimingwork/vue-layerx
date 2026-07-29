<script setup lang="ts">
import { demoGroups } from '../demos/catalog'
import DemoShell from '../ui/DemoShell.vue'
</script>

<template>
  <DemoShell :groups="demoGroups" />
</template>
