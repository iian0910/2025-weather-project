<script setup>
  import weatherIcon from '@/assets/js/weatherImg'

  const props = defineProps({
    todayForecast: {
      type: Array,
      default: () => ([])
    }
  })
</script>

<template>
  <h6 class="title mb-3">3小時預報</h6>
  <div class="row">
    <div
      class="mb-3 mb-md-0 col-4 col-md-2 text-center forecast3HR"
      v-for="(item, idx) in props.todayForecast"
      :key="idx"
    >
      <div class="subTitle mb-3">{{item.StartTime}}</div>
      <img class="mb-3" :src="weatherIcon[`icon${item.ElementValue[0].WeatherCode}`]" alt="" width="50px" height="50px">
      <h5 class="font-weight-bold mb-0">{{item.ElementValue[0].Temperature}}&#8451;</h5>
    </div>
  </div>
</template>