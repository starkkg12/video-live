<script setup lang="ts">
  import { Cell, Collapse } from 'vant'
  import { onMounted, ref, watch } from 'vue';
  import dayjs from 'dayjs'

  const props = defineProps(['lists']);
  const active = ref<string[]>([])
  const activeData = ref<any[]>([])
  const toggle = (key: string) => {
    if (active.value.includes(key)) {
        // 若已展開 → 收起
        active.value = active.value.filter(k => k !== key)
    } else {
        // 展開這個
        active.value = [key]
    }
  } 
</script>
<template>
    <div v-for="(item, index) in props.lists" :key="index">
        <Cell
            :title="item.createAt"
            is-link
            :border="false"
            :arrow-direction="active.includes(item.createAt) ? 'up' : 'down'"
            @click="toggle(item.createAt)"
        />
        <!-- 對應 Collapse 區塊 -->
        <Collapse v-model="active" accordion>
            <CollapseItem
                v-for="(item, index) in props.lists"
                :key="index"
                :name="item.createAt"
                class="collapse-item"
            >
                <template v-if="active.includes(item.createAt)">
                    <div
                    v-for="(record, idx) in item.data"
                    :key="idx"
                    class="live-item-l"
                    >
                        <div>
                            <div class="date">{{ dayjs(record.created_at).format('MM月DD日') }}</div>
                            <div class="description">{{ record.description }}</div>
                        </div>
                    </div>
                </template> 
            </CollapseItem>
        </Collapse>
    </div>    
</template>
<style lang="scss" scoped>
 .live-item-l {
  height: 100px;
  background: #2d2d2d;
  color: var(--van-text-color);
  margin-top: 14px;
  padding: 0 20px 0 30px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.live-item-l > div {
  font-size: 15px;
  color: #434343;
  line-height: 25px;
}
.live-item-l .date,
.live-item-l .description {
  color: var(--van-text-color);
}
.tab-content .van-cell {
    background: #000 !important;
    color: var(--van-text-color);
    border-bottom: unset
}
.collapse-item {
    display: flow;
    padding: 0 16px 12px;
}

</style>