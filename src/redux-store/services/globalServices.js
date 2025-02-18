import { API_ROUTER } from '@/utils/apiRoutes'
import axiosApiCall from '@/utils/axiosApiCall'

export const getAllKidsService = async () => {
  return await axiosApiCall.get(API_ROUTER?.PARENT?.GET_CHILDREN)
}
