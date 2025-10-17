/**
 * useProgressCertificates Hook
 * 
 * Custom hook for managing progress certificates with approval workflow.
 */

import { useState, useEffect, useCallback } from 'react'
import { progressCertificateService } from '@/services/progressCertificateService'
import type {
  ProgressCertificate,
  CreateProgressCertificateDTO,
  UpdateProgressCertificateDTO,
  ApproveCertificateDTO,
  RejectCertificateDTO
} from '@/types/progressCertificates'

interface UseProgressCertificatesOptions {
  projectId?: string
  subcontractId?: string
  autoLoad?: boolean
}

interface UseProgressCertificatesReturn {
  certificates: ProgressCertificate[]
  loading: boolean
  error: Error | null
  createCertificate: (data: CreateProgressCertificateDTO) => Promise<ProgressCertificate>
  updateCertificate: (id: string, data: UpdateProgressCertificateDTO) => Promise<ProgressCertificate>
  submitForApproval: (id: string) => Promise<ProgressCertificate>
  approveCertificate: (data: ApproveCertificateDTO) => Promise<ProgressCertificate>
  rejectCertificate: (data: RejectCertificateDTO) => Promise<ProgressCertificate>
  markAsPaid: (certificateId: string, paymentId: string) => Promise<ProgressCertificate>
  deleteCertificate: (id: string) => Promise<void>
  refresh: () => Promise<void>
  getCertificate: (id: string) => ProgressCertificate | undefined
  getPendingApprovals: () => ProgressCertificate[]
}

export function useProgressCertificates(
  options: UseProgressCertificatesOptions = {}
): UseProgressCertificatesReturn {
  const { projectId, subcontractId, autoLoad = true } = options

  const [certificates, setCertificates] = useState<ProgressCertificate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * Load certificates based on filters
   */
  const loadCertificates = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let data: ProgressCertificate[]

      if (projectId) {
        data = await progressCertificateService.getCertificatesByProject(projectId)
      } else if (subcontractId) {
        data = await progressCertificateService.getCertificatesBySubcontract(subcontractId)
      } else {
        const response = await progressCertificateService.queryCertificates({}, 1, 1000)
        data = response.data
      }

      setCertificates(data)
    } catch (err) {
      setError(err as Error)
      console.error('Error loading certificates:', err)
    } finally {
      setLoading(false)
    }
  }, [projectId, subcontractId])

  /**
   * Create a new certificate
   */
  const createCertificate = useCallback(async (
    data: CreateProgressCertificateDTO
  ): Promise<ProgressCertificate> => {
    setError(null)
    try {
      const newCertificate = await progressCertificateService.createCertificate(data)
      setCertificates(prev => [...prev, newCertificate])
      return newCertificate
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  /**
   * Update a certificate
   */
  const updateCertificate = useCallback(async (
    id: string,
    data: UpdateProgressCertificateDTO
  ): Promise<ProgressCertificate> => {
    setError(null)
    try {
      const updated = await progressCertificateService.updateCertificate(id, data)
      setCertificates(prev => prev.map(cert => cert.id === id ? updated : cert))
      return updated
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  /**
   * Submit certificate for approval
   */
  const submitForApproval = useCallback(async (id: string): Promise<ProgressCertificate> => {
    setError(null)
    try {
      const submitted = await progressCertificateService.submitForApproval(id)
      setCertificates(prev => prev.map(cert => cert.id === id ? submitted : cert))
      return submitted
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  /**
   * Approve a certificate
   */
  const approveCertificate = useCallback(async (
    data: ApproveCertificateDTO
  ): Promise<ProgressCertificate> => {
    setError(null)
    try {
      const approved = await progressCertificateService.approveCertificate(data)
      setCertificates(prev => prev.map(cert => cert.id === data.certificateId ? approved : cert))
      return approved
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  /**
   * Reject a certificate
   */
  const rejectCertificate = useCallback(async (
    data: RejectCertificateDTO
  ): Promise<ProgressCertificate> => {
    setError(null)
    try {
      const rejected = await progressCertificateService.rejectCertificate(data)
      setCertificates(prev => prev.map(cert => cert.id === data.certificateId ? rejected : cert))
      return rejected
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  /**
   * Mark certificate as paid
   */
  const markAsPaid = useCallback(async (
    certificateId: string,
    paymentId: string
  ): Promise<ProgressCertificate> => {
    setError(null)
    try {
      const paid = await progressCertificateService.markAsPaid(certificateId, paymentId)
      setCertificates(prev => prev.map(cert => cert.id === certificateId ? paid : cert))
      return paid
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  /**
   * Delete a certificate
   */
  const deleteCertificate = useCallback(async (id: string): Promise<void> => {
    setError(null)
    try {
      await progressCertificateService.deleteCertificate(id)
      setCertificates(prev => prev.filter(cert => cert.id !== id))
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  /**
   * Refresh certificates
   */
  const refresh = useCallback(async () => {
    await loadCertificates()
  }, [loadCertificates])

  /**
   * Get a specific certificate by ID
   */
  const getCertificate = useCallback((id: string): ProgressCertificate | undefined => {
    return certificates.find(cert => cert.id === id)
  }, [certificates])

  /**
   * Get pending approvals
   */
  const getPendingApprovals = useCallback((): ProgressCertificate[] => {
    return certificates.filter(cert => cert.status === 'pending_approval')
  }, [certificates])

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      loadCertificates()
    }
  }, [autoLoad, loadCertificates])

  return {
    certificates,
    loading,
    error,
    createCertificate,
    updateCertificate,
    submitForApproval,
    approveCertificate,
    rejectCertificate,
    markAsPaid,
    deleteCertificate,
    refresh,
    getCertificate,
    getPendingApprovals
  }
}
