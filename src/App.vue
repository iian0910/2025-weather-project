<!-- DATA: https://opendata.cwa.gov.tw/dist/opendata-swagger.html#/ -->
<script setup>
  import axios from 'axios';
  import { onMounted, ref, watch } from 'vue';
  import { city } from '@/assets/js/location'
  // import AvgTempChart from './components/AvgTempChart.vue'
  import { useWeatherStore } from '@/stores/index'
  import weatherIcon from '@/assets/js/weatherImg'

  const store = useWeatherStore()

  // // DATA
  const selectedDist = ref('中正區')

  const currentDistTemp = ref({})
  const selectedCity = ref({key: 'F-D0047-061' , value: '臺北市'})

  const distSelectorItem = ref([])
  const distAllInfoData = ref([])  

  // const weatherInfo = ref(null)

  // METHODS
  // const getCityWeatherByWeek = async(obj) => {
  //   console.log('getCityWeatherByWeek')
  //   const isDataExit = store.city.find(ele => ele.LocationName === obj.value)

  //   try {
  //     if(isDataExit){
  //       weatherInfo.value = isDataExit
  //     } else {
  //       const API_URL = import.meta.env.VITE_API_URL
  //       const API_AUTH = import.meta.env.VITE_AUTH_CODE
  
  //       const { data } = await axios.get(`${API_URL}/F-D0047-091?Authorization=${API_AUTH}&format=JSON${obj.value?`&LocationName=${obj.value}`:''}`)
  
  //       weatherInfo.value = data.records.Locations[0].Location[0]
  
  //       // 存入 store
  //       store.saveCityData(weatherInfo.value)
  //     }
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  const getDisData = async(obj) => {
    const isDataExit = store.dist.find(ele => ele.LocationsName === obj.value)

    try {
      if(isDataExit) {
        isDataExit.Location.forEach(item => distSelectorItem.value.push(item.LocationName))
        distAllInfoData.value = isDataExit.Location
        
        getCurrentDistWeatherInfo(selectedDist.value)
      } else {
        const API_URL = import.meta.env.VITE_API_URL
        const API_AUTH = import.meta.env.VITE_AUTH_CODE

        const { data } = await axios.get(`${API_URL}/${obj.key}?Authorization=${API_AUTH}&format=JSON`)

        const distData = data.records.Locations[0]
        distData.Location.forEach(item => distSelectorItem.value.push(item.LocationName))
        distAllInfoData.value = distData.Location

        getCurrentDistWeatherInfo(selectedDist.value)

        // 存入 store
        store.saveDistData(distData)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const findLatestItem = (list, timeKey = "DataTime") => {
    const now = Date.now(); // 毫秒數效率較高
    let result = null

    for (const item of list) {
      const itemTime = new Date(item[timeKey]).getTime();
      if (itemTime <= now) {
        result = item
      }
    }

    return result
  }

  const fusionCurrentWeatherInfo = (detail) => {
    const tempElement = detail.WeatherElement[0]
    const weatherElement = detail.WeatherElement[8]
    const rainElement = detail.WeatherElement[7]

    const tempItem = findLatestItem(tempElement.Time)
    const weatherItem = findLatestItem(weatherElement.Time, 'StartTime')
    const rainItem = findLatestItem(rainElement.Time, 'StartTime')

    currentDistTemp.value.temperature = tempItem?.ElementValue[0]?.Temperature ?? null
    currentDistTemp.value.weatherCode = weatherItem?.ElementValue[0]?.WeatherCode ?? null
    currentDistTemp.value.chanceOfRain = rainItem?.ElementValue[0]?.ProbabilityOfPrecipitation ?? null
  }

  const getCurrentDistWeatherInfo = (dist) => {
    const singleDetail = distAllInfoData.value.find(item => item.LocationName === dist)
    fusionCurrentWeatherInfo(singleDetail)
  }

  // // WATCH
  watch(
    () => selectedCity.value,
    (obj) => {
      if (obj) {
        distSelectorItem.value = []
        getDisData(obj)
      }
    }, {deep: true}
  )

  watch(
    () => selectedDist.value,
    (dist) => {
      if (dist) {
        getCurrentDistWeatherInfo(dist)
      }
    }, {deep: true}
  )

  // // MOUNTED
  onMounted(() => {
    getDisData(selectedCity.value)
  })
</script>

<template>
  <div class="weather_bg">
    <div class="container">
      <div class="row">
        <div class="col-12 col-md-8">
          <div class="dist_weather">
            <!-- selector -->
            <div class="d-flex mb-3">
              <select
                class="form-control mx-1"
                id="city_selector"
                v-model="selectedCity"
              >
                <option value="null" disabled selected>選擇縣市</option>
                <option
                  v-for="location in city"
                  :value="location"
                  :key="location.key"
                >
                  {{location.value}}
                </option>
              </select>
              <select
                class="form-control mx-1"
                id="dir_selector"
                v-model="selectedDist"
              >
                <option value="null" disabled selected>選擇行政區</option>
                <option
                  v-for="(dist, idx) in distSelectorItem"
                  :key="idx"
                >
                  {{dist}}
                </option>
              </select>
            </div>
            <!-- display -->
            <div class="d-flex justify-content-between">
              <div>
                <div class="mb-3">
                  <h3>{{ selectedDist }}</h3>
                  <small class="text-muted">降雨機率：{{ currentDistTemp.chanceOfRain }}%</small>
                </div>
                <div class="main_temp">
                  {{ currentDistTemp.temperature }}&#8451;
                </div>
              </div>
              <img :src="weatherIcon[`icon${currentDistTemp.weatherCode}`]" width="100px" alt="">
            </div>
          </div>
          <div class="dist_weather">Area_2</div>
          <div class="dist_weather">Area_3</div>
        </div>
        <div class="col-12 col-md-4 mt-3 mt-md-0">
          <div class="city_weather">Area_1</div>
        </div>
      </div>
      <!-- 
        <AvgTempChart
            :temp-data="weatherInfo"
          />
      -->
    </div>
  </div>
</template>
