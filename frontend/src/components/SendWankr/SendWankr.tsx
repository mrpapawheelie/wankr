import { useState } from 'react'
import { ethers } from 'ethers'
import { walletService } from '../../services/walletService'
import { STANDARD_SHAME_AMOUNT } from '../../config/contract'
import type { SendShameForm } from '../../config/types'
import { showError, showSuccess } from '../../utils/ui'

export function SendWankr() {
  const [formData, setFormData] = useState<SendShameForm>({
    targetAddress: '',
    reason: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.targetAddress.trim()) {
      showError('Please enter a target address')
      return
    }

    if (!formData.reason.trim()) {
      showError('Please enter a reason for the shame')
      return
    }

    const contractState = walletService.getContractState()
    if (!contractState.contract) {
      showError('Please connect your wallet first')
      return
    }

    try {
      setIsSubmitting(true)

      // Validate address format
      if (!ethers.isAddress(formData.targetAddress)) {
        throw new Error('Invalid Ethereum address')
      }

      // Send the shame transaction
      const tx = await contractState.contract.deliverShame(
        formData.targetAddress,
        formData.reason
      )

      showSuccess('Shame transaction sent! Waiting for confirmation...')

      // Wait for transaction confirmation
      const receipt = await tx.wait()
      
      showSuccess(`Shame delivered! Transaction: ${receipt.hash}`)

      // Reset form
      setFormData({
        targetAddress: '',
        reason: ''
      })

    } catch (error) {
      console.error('Failed to deliver shame:', error)
      showError(error instanceof Error ? error.message : 'Failed to deliver shame')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{
          fontWeight: '500',
          color: '#a0a0a0'
        }}>
          Target Address
        </label>
        <input
          type="text"
          name="targetAddress"
          value={formData.targetAddress}
          onChange={handleInputChange}
          placeholder="0x..."
          style={{
            padding: '0.75rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'white',
            fontSize: '1rem'
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{
          fontWeight: '500',
          color: '#a0a0a0'
        }}>
          Reason for Shame
        </label>
        <textarea
          name="reason"
          value={formData.reason}
          onChange={handleInputChange}
          placeholder="Why are you delivering shame?"
          rows={3}
          style={{
            padding: '0.75rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'white',
            fontSize: '1rem',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{
        padding: '0.75rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        fontSize: '0.9rem',
        color: '#a0a0a0'
      }}>
        <strong>Standard Shame Amount:</strong> {ethers.formatUnits(STANDARD_SHAME_AMOUNT, 18)} WANKR
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          background: 'linear-gradient(45deg, #ff4757, #ff3742)',
          border: 'none',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '12px',
          fontSize: '1.1rem',
          fontWeight: '600',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          opacity: isSubmitting ? 0.6 : 1
        }}
      >
        {isSubmitting ? 'Delivering Shame...' : 'Deliver 10 WANKR Shame'}
      </button>
    </form>
  )
}
