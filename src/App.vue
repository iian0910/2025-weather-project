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
  const selectedDist = ref('')

  const currentDistTemp = ref({})
  const selectedCity = ref({key: 'F-D0047-061' , value: '臺北市'})

  const distSelectorItem = ref([])
  const distAllInfoData = ref([])  
  const todayForecast = ref([])

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
        selectedDist.value = distData.Location[0].LocationName
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

  const toAMPM = (dateStr) => {
    const hour = parseInt(dateStr.slice(11, 13)) // 06 → 6
    const minute = dateStr.slice(14, 16) // "00"

    const unit = hour >= 12 ? "PM" : "AM"
    const h12 = hour % 12 === 0 ? 12 : hour % 12

    return `${h12}:${minute}${unit}`;
  }

  const getTodayForecast = (weather, temp) => {
    const result = weather.Time
      .map(mapItem => {
        const startKey = mapItem.StartTime.slice(0, 13)
        const tmpItem = temp.Time.find(t => t.DataTime.slice(0, 13) === startKey)

        return {
          StartTime: toAMPM(mapItem.StartTime),
          ElementValue: [
            {
              Temperature: tmpItem?.ElementValue?.[0]?.Temperature ?? null,
              Weather: mapItem.ElementValue[0].Weather,
              WeatherCode: mapItem.ElementValue[0].WeatherCode
            }
          ]
        }
      })

    todayForecast.value = result.slice(0, 6)
  } 

  const fusionCurrentWeatherInfo = (detail) => {
    const tempElement = detail.WeatherElement[0] // 溫度
    const rainElement = detail.WeatherElement[7] // 降雨率
    const weatherElement = detail.WeatherElement[8] // 天氣概況
    const realFeelElement = detail.WeatherElement[3] // 體感溫度
    const windElement = detail.WeatherElement[5] // 風速
    const windDirElement = detail.WeatherElement[6] // 風向
    
    getTodayForecast(weatherElement, tempElement)

    const tempItem = findLatestItem(tempElement.Time)
    const rainItem = findLatestItem(rainElement.Time, 'StartTime')
    const weatherItem = findLatestItem(weatherElement.Time, 'StartTime')
    const realFeelItem = findLatestItem(realFeelElement.Time)
    const windItem = findLatestItem(windElement.Time)
    const windDirItem = findLatestItem(windDirElement.Time)

    currentDistTemp.value.temperature = tempItem?.ElementValue[0]?.Temperature ?? null
    currentDistTemp.value.chanceOfRain = rainItem?.ElementValue[0]?.ProbabilityOfPrecipitation ?? null
    currentDistTemp.value.weatherCode = weatherItem?.ElementValue[0]?.WeatherCode ?? null
    currentDistTemp.value.ApparentTemperature = realFeelItem?.ElementValue[0]?.ApparentTemperature ?? null
    currentDistTemp.value.windSpeed = windItem?.ElementValue[0]?.WindSpeed ?? null
    currentDistTemp.value.windDirection = windDirItem?.ElementValue[0]?.WindDirection ?? null
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
            <div class="d-flex mb-3">
              <select
                class="form-control mx-1 selector"
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
                class="form-control mx-1 selector"
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
            <div class="d-flex justify-content-between">
              <div>
                <div class="mb-3">
                  <h3>{{ selectedDist }}</h3>
                  <h6 class="subTitle">降雨機率：{{ currentDistTemp.chanceOfRain }}%</h6>
                </div>
                <div class="main_temp">
                  {{ currentDistTemp.temperature }}&#8451;
                </div>
              </div>
              <img :src="weatherIcon[`icon${currentDistTemp.weatherCode}`]" width="130px" alt="">
            </div>
          </div>
          <div class="dist_weather">
            <h6 class="title mb-3">3小時預報</h6>
            <div class="row">
              <div
                class="col-6 col-md-2 text-center"
                v-for="(item, idx) in todayForecast"
                :key="idx"
              >
                <div class="subTitle mb-3">{{item.StartTime}}</div>
                <img class="mb-3" :src="weatherIcon[`icon${item.ElementValue[0].WeatherCode}`]" alt="" width="50px" height="50px">
                <h5 class="font-weight-bold mb-0">{{item.ElementValue[0].Temperature}}</h5>
              </div>
            </div>
          </div>
          <div class="dist_weather">
            <h6 class="title mb-3">空氣條件</h6>
            <div class="row pl-2">
              <div class="col-12 col-md-6 mb-3">
                <i class="subTitle bi bi-thermometer-half"></i><span class="subTitle ml-3">體感溫度</span>
                <div class="air_content">{{ currentDistTemp.ApparentTemperature }}&#8451;</div>
              </div>
              <div class="col-12 col-md-6 mb-3">
                <i class="subTitle bi bi-cloud-rain-fill"></i><span class="subTitle ml-3">降雨機率</span>
                <div class="air_content">{{ currentDistTemp.chanceOfRain }}%</div>
              </div>
              <div class="col-12 col-md-6">
                <i class="subTitle bi bi-wind"></i><span class="subTitle ml-3">風速</span>
                <div class="air_content">{{ currentDistTemp.windSpeed }}</div>
              </div>
              <div class="col-12 col-md-6">
                <i class="subTitle bi bi-signpost-split-fill"></i><span class="subTitle ml-3">風向</span>
                <div class="air_content">{{ currentDistTemp.windDirection }}</div>
              </div>
            </div>
          </div>
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
