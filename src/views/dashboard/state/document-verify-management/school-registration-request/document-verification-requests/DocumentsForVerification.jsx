'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  TextField,
  CircularProgress,
  CardHeader
} from '@mui/material'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import ImageIcon from '@mui/icons-material/Image'

// Thirdparty Imports
import { isCancel } from 'axios'

// Utils Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'
import {
  apiResponseErrorHandling,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  actionConfirmWithLoaderAlert,
  successAlert,
  toastSuccess
} from '@/utils/globalFunctions'
import PreviewDocDialog from '@/components/PreviewDocDialog'

const DocumentsForVerification = props => {
  const { dictionary = null, id } = props

  const router = useRouter()

  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [reasonText, setReasonText] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [responseForUserIdAndUserType, setResponseForUserIdAndUserType] = useState({})

  const [openPreview, setOpenPreview] = useState(false)
  const [imageUrl, setImageUrl] = useState(null)

  const handleClickOpenPreview = url => {
    setImageUrl(url)
    setOpenPreview(true)
  }

  const handleClosePreview = () => {
    setOpenPreview(false)
  }

  // get document api call
  const getSubmittedDocuments = async () => {
    setIsLoading(true)
    await axiosApiCall
      .get(API_ROUTER.STATE.GET_SCHOOL_UPLOAD_DOC(id), {
        // params: { userId: id }
      })
      .then(response => {
        setDocuments(response?.data?.response?.documents || [])
        setResponseForUserIdAndUserType(response.data.response)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          if (isVariableAnObject(apiResponseErrorHandlingData)) {
            setFormFieldsErrors(apiResponseErrorHandlingData, setError)
          } else {
            toastError(apiResponseErrorHandlingData)
          }
        }
      })
      .finally(() => setIsLoading(false))
  }

  // Handle Approved Api Call
  const handleApprove = () => {
    setIsLoading(true)
    actionConfirmWithLoaderAlert(
      {
        /**
         * swal custom data for approving vendor
         */
        deleteUrl: API_ROUTER.STATE.POST_APPROVE_REJECT_SCHOOL_REQUESTS,
        requestMethodType: 'PATCH',
        title: `${dictionary?.sweet_alert?.school_approve?.title}`,
        text: `${dictionary?.sweet_alert?.school_approve?.text}`,
        customClass: {
          confirmButton: `btn bg-success`
        },
        requestInputData: {
          userId: responseForUserIdAndUserType?.userId,
          requestUserType: responseForUserIdAndUserType?.type,
          approved: true
        }
      },
      {
        confirmButtonText: `${dictionary?.sweet_alert?.school_approve?.confirm_button}`,
        cancelButtonText: `${dictionary?.sweet_alert?.school_approve?.cancel_button}`
      },
      (callbackStatus, result) => {
        /**
         * Callback after action confirmation
         */
        if (callbackStatus) {
          successAlert({
            title: `${dictionary?.sweet_alert?.school_approve?.success}`,
            confirmButtonText: `${dictionary?.sweet_alert?.school_approve?.ok}`
          })
          setIsLoading(false)
          router.back()
        }
      }
    )
  }

  // handle Approve/Reject api call
  const handleReject = async () => {
    setIsLoading(true)

    const requestBody = {
      userId: responseForUserIdAndUserType?.userId,
      approved: false,
      reason: reasonText,
      requestUserType: responseForUserIdAndUserType?.type
    }

    await axiosApiCall
      .patch(API_ROUTER.STATE.POST_APPROVE_REJECT_SCHOOL_REQUESTS, requestBody)
      .then(response => {
        if (response.status === 200 || response.status == 201) {
          toastSuccess(dictionary?.dialog?.req_reject_dec)
          setOpenPreview(false)
        }

        router.back()
      })
      .catch(error => {
        if (!isCancel(error)) {
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          if (isVariableAnObject(apiResponseErrorHandlingData)) {
            setFormFieldsErrors(apiResponseErrorHandlingData, setError)
          } else {
            toastError(apiResponseErrorHandlingData)
          }
        }
      })
      .finally(() => setIsLoading(false))
  }

  const isPdf = url => {
    return url.toLowerCase().endsWith('.pdf')
  }

  useEffect(() => {
    getSubmittedDocuments()
  }, [])

  return (
    <Card p={3}>
      {/* <Typography variant='h6' mb={2}>
        {dictionary?.page?.vendor_management?.document_verification_requests?.document_list}
      </Typography>
      <Box display='flex' justifyContent='flex-end' gap={1} mb={2}>
        <Button variant='contained' color='primary' onClick={handleApprove}>
          {dictionary?.common?.approve}
        </Button>
        <Button variant='contained' onClick={() => setIsDialogOpen(true)} style={{ backgroundColor: '#8bc34a' }}>
          {dictionary?.common?.reject}
        </Button>
      </Box> */}
      <CardHeader
        title={dictionary?.page?.vendor_management?.document_verification_requests?.document_list}
        action={
          <div className='flex gap-2'>
            <Button variant='contained' color='primary' onClick={handleApprove}>
              {dictionary?.common?.approve}
            </Button>
            <Button variant='contained' onClick={() => setIsDialogOpen(true)} style={{ backgroundColor: '#8bc34a' }}>
              {dictionary?.common?.reject}
            </Button>
          </div>
        }
      />
      <CardContent>
        <Grid container spacing={2}>
          {Object.entries(documents)?.map((doc, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                onClick={() => handleClickOpenPreview(doc[1])}
                variant='outlined'
                sx={{ textAlign: 'center', p: 2 }}
              >
                {isPdf(doc[1]) ? (
                  <PictureAsPdfIcon color='error' sx={{ fontSize: 48, mb: 1 }} />
                ) : (
                  <ImageIcon color='error' sx={{ fontSize: 48, mb: 1 }} />
                )}
                <CardContent>
                  <Typography variant='body1'>{doc[0]}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>

      {/*---DIALOG BOX---  */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>{dictionary?.page?.school_management?.school_reject_title}</DialogTitle>
        <DialogContent>
          <Typography variant='body1' mb={2}>
            {dictionary?.page?.school_management?.school_reject_text}
          </Typography>
          <TextField
            label={dictionary?.form?.placeholder?.reason}
            multiline
            rows={4}
            fullWidth
            variant='outlined'
            value={reasonText}
            onChange={e => setReasonText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} color='secondary'>
            {dictionary?.form?.button?.cancel}
          </Button>
          <Button onClick={handleReject} variant='contained' color='primary' disabled={!reasonText.trim() || isLoading}>
            {dictionary?.common?.reject}
            {isLoading && <CircularProgress className='ml-2' size={20} sx={{ color: 'white' }} />}
          </Button>
        </DialogActions>
      </Dialog>

      {openPreview && <PreviewDocDialog imageUrl={imageUrl} open={openPreview} onClose={handleClosePreview} />}
    </Card>
  )
}

export default DocumentsForVerification
