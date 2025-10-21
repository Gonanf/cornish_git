<template>
  <header class="grid sm:grid-cols-4 max-sm:flex w-full">
    
    <Button asChild>
      <NuxtLink :to="{ name: Usuario, params: {Usuario: 1}}">Usuario</NuxtLink>
    </Button>
    
    <Button asChild>
      <NuxtLink :to="{ name: Usuario, params: {Usuario: 1}}">Usuario</NuxtLink>
    </Button>

    <Button asChild>
      <NuxtLink :to="{ name: Usuario, params: {Usuario: 1}}">Usuario</NuxtLink>
    </Button>

    <Button asChild>
      <NuxtLink :to="{ name: Usuario, params: {Usuario: 1}}">Usuario</NuxtLink>
    </Button>

  </header>
</template>
