import { defineStore } from 'pinia'

export const useWeatherStore = defineStore('weatherData', {
  state: () => ({
    city: [],
    dist: []
  }),

  actions: {
    saveCityData(data) {
      this.city.push(data)
    },
    saveDistData(data) {
      this.dist.push(data)
    }
  }
})