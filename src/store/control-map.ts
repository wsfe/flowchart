import { IControlMap } from '../interfaces'

export let controlMap: IControlMap = {}

export const updateControlMap = (newControlMap: IControlMap) => {
  controlMap = newControlMap
}
