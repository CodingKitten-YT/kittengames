"use client"

import Header from "../../components/Header"

export default function Apps() {
  return (
    <div className="min-h-screen">
      <Header currentPage="apps" />
      <main className="container mx-auto px-4 py-8 pt-28">
        <h1 className="text-2xl font-bold text-white">Apps Coming Soon</h1>
      </main>
    </div>
  )
}