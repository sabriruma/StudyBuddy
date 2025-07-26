import React from 'react'

const ModalWrapper = ({children, closeModal}) => {
  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 pb-20 text-center sm:block sm:p-0 relative">
            <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={closeModal}/>

            <div className="inline-block transform transition-all sm:my-8 align-middle w-[500px] max-h-[900px] overflow-y-auto">
                {children}
            </div>
        </div>
    </div>
  )
}

export default ModalWrapper