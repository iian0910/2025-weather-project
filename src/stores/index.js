import { defineStore } from 'pinia'
import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL
})

export const useWeatherStore = defineStore('weatherData', {
  state: () => ({
    dist3Day: []
  }),

  actions: {
    async fetchThe3DForecast(obj) {
      const auth = import.meta.env.VITE_AUTH_CODE

      const { data } = await api.get(`/${obj.key_3D}?Authorization=${auth}&format=JSON`)

      this.dist3Day.push(data.records.Locations[0])

      return data
    }
  }
})