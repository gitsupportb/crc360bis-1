"use client"
import React from "react"

const ReportingBAMPage = () => {
  return (
    <div style={{ width: "100%", height: "100vh", border: "none" }}>
      <iframe
        src="http://127.0.0.1:8000/" 
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
      />
    </div>
  )
}

export default ReportingBAMPage
