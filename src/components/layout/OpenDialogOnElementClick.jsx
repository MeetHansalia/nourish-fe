import { useState, useEffect } from 'react'

const OpenDialogOnElementClick = props => {
  const {
    element: Element,
    dialog: Dialog,
    elementProps,
    dialogProps,
    // isApproved,
    openFromParent,
    setDishCreateData,
    setIsDialogOpen // Accept the prop from the parent
  } = props

  const [open, setOpen] = useState(false)

  const { onClick: elementOnClick, ...restElementProps } = elementProps

  useEffect(() => {
    if (openFromParent !== undefined) {
      setOpen(openFromParent)
    }
  }, [openFromParent])

  useEffect(() => {
    if (setIsDialogOpen) {
      setIsDialogOpen(open)
    }
  }, [open, setIsDialogOpen])

  const handleOnClick = e => {
    elementProps.onClick && elementProps.onClick(e)
    setOpen(true)
  }

  return (
    <>
      {/* dont remove this Element condition (in school login element is not passed) */}
      {Element && <Element onClick={handleOnClick} {...restElementProps} />}
      <Dialog
        open={open}
        setOpen={setOpen}
        setDishCreateData={setDishCreateData}
        dialogProps={dialogProps}
        {...dialogProps}
        // isApproved={isApproved}
        mode={'add'}
      />
    </>
  )
}

export default OpenDialogOnElementClick
