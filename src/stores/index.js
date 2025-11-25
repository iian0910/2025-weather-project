import { defineStore } from 'pinia'

export const useWeatherStore = defineStore('weatherData', {
  state: () => ({
    dist3Day: []
  }),

  actions: {
    save3DayDistData(data) {
      this.dist3Day.push(data)
    }
  }
})