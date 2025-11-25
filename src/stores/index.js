import { defineStore } from 'pinia'
import axios from 'axios'

import { useAlert } from '../composables/useAlert'
import { useLoading } from '@/composables/useLoading.js'

const alert = useAlert()
const loading = useLoading()

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
      loading.show()
      try {
        const auth = import.meta.env.VITE_AUTH_CODE

        const { data } = await api.get(`/${obj.key_3D}?Authorization=${auth}&format=JSON`)

        if (data.success) {
          alert.success('讀取成功!!!')
          this.dist3Day.push(data.records.Locations[0])
        } else {
          alert.danger('讀取失敗!!!')
        }
        return data
      } catch (error) {
        alert.danger(error)
      } finally {
        loading.hide()
      }
    }
  }
})