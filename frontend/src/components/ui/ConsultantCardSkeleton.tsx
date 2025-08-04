import React from 'react'
import { Card } from './Card'

export function ConsultantCardSkeleton() {
  return (
    <Card className="bg-white border border-gray-200 rounded-2xl max-w-sm mx-auto overflow-hidden">
      {/* Profile Photo Skeleton with shimmer */}
      <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-shimmer transform -skew-x-12"></div>
        <div className="absolute inset-0 bg-gray-300"></div>
      </div>
      
      {/* Content Skeleton */}
      <div className="p-6">
        {/* Name & Title Skeleton */}
        <div className="text-center mb-4 space-y-2">
          <div className="relative overflow-hidden">
            <div className="h-6 bg-gray-300 rounded-lg w-3/4 mx-auto"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-shimmer transform -skew-x-12"></div>
          </div>
          <div className="relative overflow-hidden">
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-shimmer transform -skew-x-12"></div>
          </div>
          <div className="relative overflow-hidden">
            <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-shimmer transform -skew-x-12"></div>
          </div>
        </div>

        {/* Stats Row Skeleton */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="relative overflow-hidden">
                <div className="h-6 bg-gray-300 rounded"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-shimmer transform -skew-x-12"></div>
              </div>
              <div className="relative overflow-hidden">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-shimmer transform -skew-x-12"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Location Skeleton */}
        <div className="flex items-center justify-center gap-1 mb-4">
          <div className="relative overflow-hidden">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-shimmer transform -skew-x-12"></div>
          </div>
          <div className="relative overflow-hidden">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-shimmer transform -skew-x-12"></div>
          </div>
        </div>

        {/* Specialties Tags Skeleton */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {[20, 16, 12].map((width, i) => (
            <div key={i} className="relative overflow-hidden">
              <div className={`h-6 bg-gray-200 rounded-full w-${width}`}></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-shimmer transform -skew-x-12"></div>
            </div>
          ))}
        </div>
        
        {/* Button Skeleton */}
        <div className="relative overflow-hidden">
          <div className="h-10 bg-gray-300 rounded-lg"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-shimmer transform -skew-x-12"></div>
        </div>
      </div>
    </Card>
  )
}

export default ConsultantCardSkeleton
