<!-- DATA: https://opendata.cwa.gov.tw/dist/opendata-swagger.html#/ -->
<script setup>
  import { onMounted, ref, watch } from 'vue';
  import { city } from '@/assets/js/location'
  // import AvgTempChart from './components/AvgTempChart.vue'
  import { useWeatherStore } from '@/stores/index'
  import weatherIcon from '@/assets/js/weatherImg'
  import { formatTheTimeString } from '@/assets/js/common'

  import _ from 'lodash'

  const store = useWeatherStore()

  // DATA
  const selectedDist = ref('')

  const currentDistTemp = ref({})
  const selectedCity = ref({key_3D: 'F-D0047-061', key_7D: 'F-D0047-063', value: '臺北市'})

  const distSelectorItem = ref([])
  const todayForecast = ref([])
  const next7DayForecast = ref([])

  // METHODS
  const fetchWeatherForecast = async(obj) => {
    // 從 store 發送 3 日跟 7 日的預報 API 並回傳
    // 從 store 整理行政區的下拉選項並回傳
    await store.fetchWeatherForecast(obj)

    const districtData = _.pick(store.dist3Day, obj.key_3D)
    distSelectorItem.value = districtData[obj.key_3D].map(item => item.LocationName)
    selectedDist.value = distSelectorItem.value[0] // 鄉鎮預設選第一個項目

    getWeatherInfo(selectedDist.value)
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

  const dataEvery3HR = (weather, temp) => {
    const result = weather.Time
      .map(mapItem => {
        const startKey = mapItem.StartTime.slice(0, 13)
        const tmpItem = temp.Time.find(t => t.DataTime.slice(0, 13) === startKey)

        return {
          StartTime: formatTheTimeString(mapItem.StartTime),
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

  const fusion3DayWeatherInfo = (weatherObj) => {
    const mapping = [
      { idx: 0, key: 'temperature', field: 'Temperature' }, // 溫度
      { idx: 3, key: "apparentTemperature", field: "ApparentTemperature" }, // 體感溫度
      { idx: 5, key: "windSpeed", field: "WindSpeed" }, // 風速
      { idx: 6, key: "windDirection", field: "WindDirection" }, // 風向
      { idx: 7, key: "chanceOfRain", field: "ProbabilityOfPrecipitation", useStart: true }, // 3小時降雨機率
      { idx: 8, key: "weatherCode", field: "WeatherCode", useStart: true } // 天氣現象(天氣icon)
    ]
    mapping.forEach(({idx, key, field, useStart}) => {
      const element = weatherObj.WeatherElement[idx]
      const item = findLatestItem(element.Time, useStart ? 'StartTime': undefined)
      currentDistTemp.value[key] = item?.ElementValue?.[0]?.[field] ?? null
    })
  }

  const fusion7DayWeatherInfo = (weatherObj) => {
    const result = []
    const avgTemp = weatherObj.WeatherElement[0].Time
    const weather = weatherObj.WeatherElement[12].Time

    avgTemp.forEach((item, index) => {
      const date = item.StartTime.slice(0, 10)
      const hour = parseInt(item.StartTime.slice(11, 13))

      const weatherItem = weather[index]
      const weatherCode = weatherItem?.ElementValue?.[0]?.WeatherCode ?? null

      let dayItem = result.find(item => item.Date === date)

      if (!dayItem) {
        dayItem = {
          Date: date,
          ElementValue: [
            {
              DayTemperature: null,
              DayWeatherCode: null,
              NighTemperature: null,
              NighWeatherCode: null
            }
          ]
        }
        result.push(dayItem)
      }
      
      const temp = item.ElementValue[0].Temperature;
  
      if (hour === 6 || hour === 12) {
        dayItem.ElementValue[0].DayTemperature = temp
        dayItem.ElementValue[0].DayWeatherCode = weatherCode
      } else if (hour === 18) {
        dayItem.ElementValue[0].NighTemperature = temp
        dayItem.ElementValue[0].NighWeatherCode = weatherCode
      }
    })

    next7DayForecast.value = result
    console.log(next7DayForecast.value)
  }

  const getWeatherInfo = (dist) => {
    const weatherObj3Day = store.dist3Day[selectedCity.value.key_3D].find(item => item.LocationName === dist)
    const weatherObj7Day = store.dist7Day[selectedCity.value.key_7D].find(item => item.LocationName === dist)

    fusion3DayWeatherInfo(weatherObj3Day)
    fusion7DayWeatherInfo(weatherObj7Day)
    dataEvery3HR(weatherObj3Day.WeatherElement[8], weatherObj3Day.WeatherElement[0])
  }

  // WATCH
  watch(
    () => selectedCity.value,
    (obj) => {
      if (obj) {
        fetchWeatherForecast(obj)
      }
    }, {deep: true}
  )

  watch(
    () => selectedDist.value,
    (dist) => {
      if (dist) {
        getWeatherInfo(dist)
      }
    }, {deep: true}
  )

  // MOUNTED
  onMounted(() => {
    fetchWeatherForecast(selectedCity.value)
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
                <h5 class="font-weight-bold mb-0">{{item.ElementValue[0].Temperature}}&#8451;</h5>
              </div>
            </div>
          </div>
          <div class="dist_weather">
            <h6 class="title mb-3">空氣條件</h6>
            <div class="row pl-2">
              <div class="col-12 col-md-6 mb-3">
                <i class="subTitle bi bi-thermometer-half"></i><span class="subTitle ml-3">體感溫度</span>
                <div class="air_content">{{ currentDistTemp.apparentTemperature }}&#8451;</div>
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
          <div class="city_weather">
            <h6 class="title mb-3">一周預報</h6>
            <div class="next7DayForecast" v-for="item in next7DayForecast" :key="item.Date">
              <div class="subTitle mb-3">{{ item.Date }}</div>
              <div class="d-flex justify-content-around">
                <div class="d-flex align-items-center">
                  <img class="mr-3" :src="weatherIcon[`icon${item.ElementValue[0].DayWeatherCode}`]" alt="" width="50px" height="50px">
                  <div>{{item.ElementValue[0].DayTemperature}}&#8451;</div>
                </div>
                <div class="d-flex align-items-center">
                  <img class="mr-3" :src="weatherIcon[`iconNight${item.ElementValue[0].NighWeatherCode}`]" alt="" width="50px" height="50px">
                  <div>{{item.ElementValue[0].NighTemperature}}&#8451;</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- <AvgTempChart
        :temp-data="weatherInfo"
      />-->
      
    </div>
  </div>
</template>
