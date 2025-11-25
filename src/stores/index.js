import { defineStore } from 'pinia'
import axios from 'axios'

import { useAlert } from '../composables/useAlert'
const alert = useAlert()

const baseURL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL
})

export const useWeatherStore = defineStore('weatherData', {
  state: () => ({
    dist3Day: []
  }),

  actions: {
    async fetchThe3DayForecast(obj) {
      const auth = import.meta.env.VITE_AUTH_CODE

      const { data } = await api.get(`/${obj.key_3D}?Authorization=${auth}&format=JSON`)

      if (data.success) {
        alert.success('讀取成功!!!')
        this.dist3Day.push(data.records.Locations[0])
      } else {
        alert.danger('讀取失敗!!!')
      }

      return data
    }
  }
})