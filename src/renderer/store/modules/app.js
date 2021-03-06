import api from '@/api'
import { getSystemTheme } from '@/components/Native/utils'

const BASE_INTERVAL = 1000
const PER_INTERVAL = 100
const MIN_INTERVAL = 500
const MAX_INTERVAL = 6000

const state = {
  systemTheme: getSystemTheme(),
  aboutPanelVisible: false,
  engineInfo: {
    version: '',
    enabledFeatures: []
  },
  engineOptions: {},
  interval: BASE_INTERVAL,
  stat: {
    downloadSpeed: 0,
    uploadSpeed: 0,
    numActive: 0,
    numWaiting: 0,
    numStopped: 0
  },
  addTaskVisible: false,
  addTaskType: 'uri',
  addTaskUrl: '',
  addTaskTorrents: [],
  addTaskOptions: {}
}

const getters = {
}

const mutations = {
  CHANGE_SYSTEM_THEME (state, theme) {
    state.systemTheme = theme
  },
  CHANGE_ABOUT_PANEL_VISIBLE (state, visible) {
    state.aboutPanelVisible = visible
  },
  UPDATE_ENGINE_INFO (state, engineInfo) {
    state.engineInfo = { ...state.engineInfo, ...engineInfo }
  },
  UPDATE_ENGINE_OPTIONS (state, engineOptions) {
    state.engineOptions = { ...state.engineOptions, ...engineOptions }
  },
  UPDATE_GLOBAL_STAT (state, stat) {
    state.stat = stat
  },
  CHANGE_ADD_TASK_VISIBLE (state, visible) {
    state.addTaskVisible = visible
  },
  CHANGE_ADD_TASK_TYPE (state, taskType) {
    state.addTaskType = taskType
  },
  CHANGE_ADD_TASK_URL (state, text) {
    state.addTaskUrl = text
  },
  CHANGE_ADD_TASK_TORRENTS (state, fileList) {
    state.addTaskTorrents = [...fileList]
  },
  UPDATE_ADD_TASK_OPTIONS (state, options) {
    state.addTaskOptions = {
      ...options
    }
  },
  UPDATE_INTERVAL (state, millisecond) {
    let interval = millisecond
    if (millisecond > MAX_INTERVAL) {
      interval = MAX_INTERVAL
    }
    if (millisecond < MIN_INTERVAL) {
      interval = MIN_INTERVAL
    }
    if (state.interval === interval) {
      return
    }
    state.interval = interval
  },
  INCREASE_INTERVAL (state, millisecond) {
    if (state.interval < MAX_INTERVAL) {
      state.interval += millisecond
    }
  },
  DECREASE_INTERVAL (state, millisecond) {
    if (state.interval > MIN_INTERVAL) {
      state.interval -= millisecond
    }
  }
}

const actions = {
  updateSystemTheme ({ commit }, theme) {
    commit('CHANGE_SYSTEM_THEME', theme)
  },
  showAboutPanel ({ commit }) {
    commit('CHANGE_ABOUT_PANEL_VISIBLE', true)
  },
  hideAboutPanel ({ commit }) {
    commit('CHANGE_ABOUT_PANEL_VISIBLE', false)
  },
  fetchEngineInfo ({ commit }) {
    api.getVersion()
      .then((data) => {
        commit('UPDATE_ENGINE_INFO', data)
      })
  },
  fetchEngineOptions ({ commit }) {
    return new Promise((resolve) => {
      api.getGlobalOption()
        .then((data) => {
          commit('UPDATE_ENGINE_OPTIONS', data)
          resolve(data)
        })
    })
  },
  fetchGlobalStat ({ commit, dispatch }) {
    api.getGlobalStat()
      .then((data) => {
        const stat = {}
        Object.keys(data).forEach((key) => {
          stat[key] = Number(data[key])
        })

        const { numActive } = stat
        if (numActive > 0) {
          const interval = BASE_INTERVAL - PER_INTERVAL * numActive
          dispatch('updateInterval', interval)
        } else {
          // fix downloadSpeed when numActive = 0
          stat.downloadSpeed = 0
          dispatch('increaseInterval')
        }
        commit('UPDATE_GLOBAL_STAT', stat)
      })
  },
  increaseInterval ({ commit }, millisecond = 100) {
    commit('INCREASE_INTERVAL', millisecond)
  },
  showAddTaskDialog ({ commit }, taskType) {
    commit('CHANGE_ADD_TASK_TYPE', taskType)
    commit('CHANGE_ADD_TASK_VISIBLE', true)
  },
  hideAddTaskDialog ({ commit }) {
    commit('CHANGE_ADD_TASK_VISIBLE', false)
    commit('CHANGE_ADD_TASK_URL', '')
    commit('CHANGE_ADD_TASK_TORRENTS', [])
  },
  changeAddTaskType ({ commit }, taskType) {
    commit('CHANGE_ADD_TASK_TYPE', taskType)
  },
  updateAddTaskUrl ({ commit }, text = '') {
    commit('CHANGE_ADD_TASK_URL', text)
  },
  addTaskAddTorrents ({ commit }, { fileList }) {
    commit('CHANGE_ADD_TASK_TORRENTS', fileList)
  },
  updateAddTaskOptions ({ commit }, options = {}) {
    commit('UPDATE_ADD_TASK_OPTIONS', options)
  },
  updateInterval ({ commit }, millisecond) {
    commit('UPDATE_INTERVAL', millisecond)
  },
  resetInterval ({ commit }) {
    commit('UPDATE_INTERVAL', BASE_INTERVAL)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
