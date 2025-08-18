'use client'

import { useState } from 'react'
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Send,
  Clock,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                뒤로
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">연락처</h1>
              <p className="text-gray-600 mt-1">JeonseVault 팀에 문의하세요</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">문의하기</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="홍길동"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="hong@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제목 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="문의 제목"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    메시지 *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="문의 내용을 입력해주세요..."
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  메시지 보내기
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">연락처 정보</h2>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">이메일</h3>
                      <p className="text-gray-600">contact@jeonsevault.com</p>
                      <p className="text-gray-600">support@jeonsevault.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">전화</h3>
                      <p className="text-gray-600">1588-1234</p>
                      <p className="text-gray-600">+82-2-1234-5678</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <MapPin className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">주소</h3>
                      <p className="text-gray-600">서울특별시 강남구 테헤란로 123</p>
                      <p className="text-gray-600">JeonseVault 빌딩 15층</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">운영 시간</h3>
                      <p className="text-gray-600">평일: 09:00 - 18:00</p>
                      <p className="text-gray-600">주말: 10:00 - 17:00</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">실시간 채팅</h2>
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 고객 지원</h3>
                  <p className="text-gray-600 mb-6">
                    실시간 채팅으로 즉시 답변을 받으세요
                  </p>
                  <Button className="w-full">
                    채팅 시작하기
                  </Button>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
                <div className="text-center">
                  <Users className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">JeonseVault 팀</h3>
                  <p className="text-blue-100 mb-6">
                    블록체인과 부동산 전문가들이 모여 만든 혁신적인 플랫폼
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-semibold">개발팀</div>
                      <div className="text-blue-100">15명</div>
                    </div>
                    <div>
                      <div className="font-semibold">고객지원팀</div>
                      <div className="text-blue-100">8명</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
