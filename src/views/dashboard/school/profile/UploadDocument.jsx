'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  FormHelperText,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  styled,
  Typography
} from '@mui/material'

// Third-party Imports
import { yupResolver } from '@hookform/resolvers/yup'
import { isCancel } from 'axios'
import { useDropzone } from 'react-dropzone'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'

// Component Imports
import CustomTextField from '@/@core/components/mui/TextField'
import CustomAvatar from '@core/components/mui/Avatar'

import axiosApiCall from '@/utils/axiosApiCall'
import {
  actionConfirmWithLoaderAlert,
  apiResponseErrorHandling,
  isVariableAnObject,
  setFormFieldsErrors,
  successAlert,
  toastError,
  toastSuccess
} from '@/utils/globalFunctions'

// Styled Component Imports
import AppReactDropzone from '@/libs/styles/AppReactDropzone'
import { API_ROUTER } from '@/utils/apiRoutes'

// Styled Dropzone Component
const Dropzone = styled(AppReactDropzone)(({ theme }) => ({
  '& .dropzone': {
    minHeight: 'unset',
    padding: theme.spacing(12),
    [theme.breakpoints.down('sm')]: {
      paddingInline: theme.spacing(5)
    },
    '&+.MuiList-root .MuiListItem-root .file-name': {
      fontWeight: theme.typography.body1.fontWeight
    }
  }
}))

const UploadDocument = ({ dictionary, userData }) => {
  // states
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(false)
  const [isDisplayUploadedImage, setIsDisplayUploadedImage] = useState(true)
  const [uploadedFile, setUploadedFile] = useState(userData?.documents)
  const [files, setFiles] = useState([])

  /**
   * Page form: Start
   */
  const formValidationSchema = yup.object({
    docType: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.document_type)
  })

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: yupResolver(formValidationSchema),
    defaultValues: {}
  })

  // dropzone
  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    onDrop: acceptedFiles => {
      setFiles(acceptedFiles.map(file => Object.assign(file)))
    }
  })

  useEffect(() => {
    setUploadedFile(userData?.documents)

    if (userData.documents) {
      const docTypeText = Object.keys(userData.documents)[0]

      setValue('docType', docTypeText)
    }
  }, [userData])

  useEffect(() => {
    if (files.length) {
      setIsDisplayUploadedImage(false)
    }
  }, [files])

  const renderFilePreview = file => {
    if (file.type.startsWith('image')) {
      return <img width={38} height={38} alt={file.name} src={URL.createObjectURL(file)} />
    } else {
      return <i className='tabler-file-description' />
    }
  }

  const handleRemoveFile = file => {
    const uploadedFiles = files
    const filtered = uploadedFiles.filter(i => i.name !== file.name)

    setFiles([...filtered])
  }

  const fileList = files.map(file => (
    <ListItem key={file.name} className='pis-4 plb-3'>
      <div className='file-details'>
        <div className='file-preview'>{renderFilePreview(file)}</div>
        <div>
          <Typography className='file-name font-medium' color='text.primary'>
            {file.name}
          </Typography>
          <Typography className='file-size' variant='body2'>
            {Math.round(file.size / 100) / 10 > 1000
              ? `${(Math.round(file.size / 100) / 10000).toFixed(1)} mb`
              : `${(Math.round(file.size / 100) / 10).toFixed(1)} kb`}
          </Typography>
        </div>
      </div>
      <IconButton onClick={() => handleRemoveFile(file)}>
        <i className='tabler-x text-xl' />
      </IconButton>
    </ListItem>
  ))

  // const uploadedFileList =
  //   uploadedFile &&
  //   Object.values(uploadedFile).map(file => (
  //     <ListItem key={file} className='pis-4 plb-3'>
  //       <div className='file-details'>
  //         <div className='file-preview'>
  //           <img src={file} />
  //         </div>
  //       </div>
  //     </ListItem>
  //   ))
  const uploadedFileList =
    uploadedFile &&
    Object.values(uploadedFile).map((file, index) => (
      <ListItem key={index} className='pis-4 plb-3'>
        <div className='file-details'>
          <div className='file-preview'>
            <img src={file} alt={`Uploaded File ${index + 1}`} />
          </div>
          <div>
            <Typography className='file-name font-medium' color='text.primary'>
              {`Document ${index + 1}`} {/* Use a fallback name */}
            </Typography>
            <Typography className='file-size' variant='body2'>
              {/* Use a placeholder or additional logic if size is unavailable */}
              Size: Not Available
            </Typography>
          </div>
        </div>
      </ListItem>
    ))

  // const handleRemoveAllFiles = () => {
  //   setFiles([])
  // }

  const handleDocumentDelete = docName => {
    // console.log('docName', docName)
    actionConfirmWithLoaderAlert(
      {
        /**
         * swal custom data for activating user
         */
        deleteUrl: `/v1/school-admin-dashboard/delete-document`,
        requestMethodType: 'DELETE',
        title: `${dictionary?.sweet_alert?.document_delete?.title}`,
        text: `${dictionary?.sweet_alert?.document_delete?.text}`,
        customClass: {
          confirmButton: `btn bg-warning`
        },
        requestInputData: {
          docType: docName
        }
      },
      {
        confirmButtonText: `${dictionary?.sweet_alert?.user_delete?.confirm_button}`,
        cancelButtonText: `${dictionary?.sweet_alert?.user_delete?.cancel_button}`
      },
      (callbackStatus, result) => {
        /**
         * Callback after action confirmation
         */
        if (callbackStatus) {
          // getAllStaffMembers()
          successAlert({
            title: `${dictionary?.sweet_alert?.user_delete?.success}`,
            confirmButtonText: `${dictionary?.sweet_alert?.user_activate?.ok}`
          })
        }

        // getAllSuspendedUsers()
      }
    )
  }

  const onSubmit = async data => {
    setIsFormSubmitLoading(true)
    data.file = files[0]

    axiosApiCall
      .post(API_ROUTER.SCHOOL_ADMIN.UPLOAD_DOCUMENT, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        const responseBody = response?.data

        setUploadedFile(responseBody?.response?.userData?.documents)
        setIsDisplayUploadedImage(true)
        setFiles([])

        toastSuccess(responseBody?.message)
        setIsFormSubmitLoading(false)
      })
      .catch(error => {
        // console.log('error', error)

        if (!isCancel(error)) {
          setIsFormSubmitLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          if (isVariableAnObject(apiResponseErrorHandlingData)) {
            setFormFieldsErrors(apiResponseErrorHandlingData, setError)
          } else {
            toastError(apiResponseErrorHandlingData)
          }
        }
      })
  }

  return (
    <form noValidate action={() => {}} onSubmit={handleSubmit(onSubmit)}>
      <Dropzone>
        <Card>
          <CardHeader
            title={dictionary?.page?.common?.upload_document}
            action={
              <Button disabled={isFormSubmitLoading} variant='contained' sx={{ m: 1 }} type='submit'>
                {dictionary?.form?.button?.Upload}
                {isFormSubmitLoading && <CircularProgress className='ml-2' size={20} sx={{ color: 'white' }} />}
              </Button>
            }
            sx={{ '& .MuiCardHeader-action': { alignSelf: 'center' } }}
          />
          <CardContent>
            <div {...getRootProps({ className: 'dropzone' })}>
              <Controller
                name='file'
                control={control}
                render={({ field }) => <input {...field} {...getInputProps()} />}
              />

              <div className='flex items-center flex-col gap-2 text-center'>
                <CustomAvatar variant='rounded' skin='light' color='secondary'>
                  <i className='tabler-upload' />
                </CustomAvatar>
                <Typography variant='h4'>{dictionary?.form?.placeholder?.drop_upload_file}</Typography>
              </div>
            </div>
            <Typography className='text-center file-name font-medium' color='text.primary'>
              {dictionary?.page?.profile_management?.doc_upload_hint}
            </Typography>
            {errors.file && <FormHelperText error>{errors?.file?.message}</FormHelperText>}
            {files.length ? (
              <>
                <List>{fileList}</List>
                <div className='buttons'>
                  {/*
                      <Button color='error' variant='tonal' onClick={handleRemoveAllFiles}>
                        {dictionary?.form?.button?.remove_all}
                      </Button>
                      */}
                </div>
              </>
            ) : null}

            {/* <Grid container spacing={2}>
              {uploadedFile &&
                Object.entries(uploadedFile).map(([name, url], index) => (
                  // ----old document display structure

                  // <Grid item xs={12} sm={4} key={index}>
                  //   <ListItem>
                  //     <div style={{ textAlign: 'center' }}>
                  //       <img
                  //         src={url}
                  //         alt={name}
                  //         style={{
                  //           maxWidth: '100%',
                  //           maxHeight: '100px',
                  //           borderRadius: '5px'
                  //         }}
                  //       />
                  //       <Typography variant='body2' color='textPrimary' style={{ marginTop: '8px' }}>
                  //         {name}
                  //       </Typography>
                  //     </div>
                  //   </ListItem>
                  // </Grid>
                  <Grid item xs={12} sm={4} key={index} sx={{ position: 'relative' }}>
                    <Card
                      sx={{
                        position: 'relative',
                        borderRadius: 2,
                        overflow: 'hidden',
                        height: '200px',
                        boxShadow: 3
                      }}
                    >
                      <img
                        src={url}
                        alt={name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '5px'
                        }}
                      />
                      {/* Cross Icon */}
                      {/* <IconButton
                        onClick={() => {
                          handleDocumentDelete(name)
                          console.log(`Delete clicked for: ${name}`)
                          const updatedFiles = { ...uploadedFile }

                          delete updatedFiles[docType]
                          setUploadedFile(updatedFiles)
                        }}
                        sx={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          color: 'red',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 1)'
                          }
                        }}
                      >
                        <i className='tabler-x' />
                      </IconButton>
                    </Card>
                    <Typography variant='body2' color='textPrimary' align='center' sx={{ marginTop: '8px' }}>
                      {name}
                    </Typography>
                  </Grid>
                ))}
            </Grid> */}

<Grid container spacing={2}>
              {uploadedFile &&
                Object.entries(uploadedFile).map(([name, url], index) => (
                  <Grid item xs={12} sm={4} key={index} sx={{ position: 'relative' }}>
                    <Card
                      sx={{
                        position: 'relative',
                        borderRadius: 2,
                        overflow: 'hidden',
                        height: '200px',
                        boxShadow: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5',
                        padding: 2
                      }}
                    >
                      {url.endsWith('.pdf') ? (
                        // Directly display PDFs inside iframe
                        <iframe src={url} width='100%' height='200px' style={{ borderRadius: '5px' }}></iframe>
                      ) : url.endsWith('.doc') || url.endsWith('.docx') ? (
                        // Embed DOC/DOCX using Google Docs Viewer
                        <iframe
                          src={`https://docs.google.com/gview?url=${url}&embedded=true`}
                          width='100%'
                          height='200px'
                          style={{ borderRadius: '5px' }}
                        ></iframe>
                      ) : (
                        // Show image preview for other file types
                        <img
                          src={url}
                          alt={name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '5px'
                          }}
                        />
                      )}
                    </Card>
                    <Typography variant='body2' color='textPrimary' align='center' sx={{ marginTop: '8px' }}>
                      {name}
                    </Typography>
                  </Grid>
                ))}
            </Grid>

            <Grid container>
              <Grid item xs={12}>
                <Controller
                  name='docType'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      value={field.value ?? ''}
                      label={dictionary?.form?.label?.document_type}
                      placeholder={dictionary?.form?.placeholder?.document_type}
                      {...(errors.docType && { error: true, helperText: errors.docType.message })}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Dropzone>
    </form>
  )
}

export default UploadDocument
