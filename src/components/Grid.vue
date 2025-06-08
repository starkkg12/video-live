<script setup lang="ts">
  import { Grid, GridItem } from 'vant'
  interface GridItemData {
    id: number | string
    icon: string
    text: string
    link: string | ((item: GridItemData) => void)
  }

  interface Props {
    items: GridItemData[]
  }

  const props: Props = defineProps<Props>()

  function handleClickGridItem(item: GridItemData) {
    if (typeof item.link === 'string') {
      window.location.href = item.link
    } else {
      item.link(item)
    }
  }
</script>

<template>
  <div class="cc-grid">
    <Grid :border="false" icon-size="min(10vw, 60px)">
      <GridItem
        v-for="item in props.items"
        :key="item.id"
        :icon="item.icon"
        :text="item.text"
        @click="handleClickGridItem(item)"
      />
    </Grid>
  </div>
</template>

<style scoped>
  .cc-grid :deep(.van-grid-item__text) {
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
