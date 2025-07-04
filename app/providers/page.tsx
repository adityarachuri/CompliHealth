"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Clock,
  ShipWheelIcon as Wheelchair,
  Car,
  Heart,
  Brain,
  Eye,
  Bone,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Calendar,
  Filter,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

// Sample provider data
const providersData = [
  {
    id: 1,
    name: "City General Hospital",
    type: "Hospital",
    specialty: "General Practice",
    address: "123 Main St, Downtown",
    phone: "(555) 123-4567",
    email: "info@citygeneral.com",
    website: "www.citygeneral.com",
    distance: "2.3 miles",
    rating: 4.8,
    reviewCount: 1247,
    networkStatus: "In-Network",
    acceptingPatients: true,
    languages: ["English", "Spanish", "French"],
    accessibility: {
      wheelchairAccessible: true,
      parking: true,
      emergencyServices: true,
    },
    services: ["Emergency Care", "Surgery", "Cardiology", "Orthopedics", "Radiology", "Laboratory", "Pharmacy", "ICU"],
    hours: {
      monday: "24/7",
      tuesday: "24/7",
      wednesday: "24/7",
      thursday: "24/7",
      friday: "24/7",
      saturday: "24/7",
      sunday: "24/7",
    },
    insurance: ["Blue Cross", "Aetna", "Cigna", "UnitedHealth", "Medicare", "Medicaid"],
  },
  {
    id: 2,
    name: "Metro Cardiology Center",
    type: "Specialist",
    specialty: "Cardiology",
    address: "456 Heart Ave, Medical District",
    phone: "(555) 234-5678",
    email: "appointments@metrocardio.com",
    website: "www.metrocardiology.com",
    distance: "1.8 miles",
    rating: 4.6,
    reviewCount: 892,
    networkStatus: "In-Network",
    acceptingPatients: true,
    languages: ["English", "Spanish"],
    accessibility: {
      wheelchairAccessible: true,
      parking: true,
      emergencyServices: false,
    },
    services: [
      "Cardiac Catheterization",
      "Echocardiography",
      "Stress Testing",
      "Pacemaker Implantation",
      "Heart Surgery",
      "Cardiac Rehabilitation",
    ],
    hours: {
      monday: "8:00 AM - 6:00 PM",
      tuesday: "8:00 AM - 6:00 PM",
      wednesday: "8:00 AM - 6:00 PM",
      thursday: "8:00 AM - 6:00 PM",
      friday: "8:00 AM - 5:00 PM",
      saturday: "9:00 AM - 1:00 PM",
      sunday: "Closed",
    },
    insurance: ["Blue Cross", "Aetna", "Cigna", "UnitedHealth"],
  },
  {
    id: 3,
    name: "Family Health Clinic",
    type: "Clinic",
    specialty: "General Practice",
    address: "789 Wellness Blvd, Suburbia",
    phone: "(555) 345-6789",
    email: "contact@familyhealth.com",
    website: "www.familyhealthclinic.com",
    distance: "3.1 miles",
    rating: 4.4,
    reviewCount: 634,
    networkStatus: "In-Network",
    acceptingPatients: false,
    languages: ["English"],
    accessibility: {
      wheelchairAccessible: true,
      parking: true,
      emergencyServices: false,
    },
    services: [
      "Primary Care",
      "Preventive Care",
      "Vaccinations",
      "Physical Exams",
      "Chronic Disease Management",
      "Minor Procedures",
    ],
    hours: {
      monday: "7:00 AM - 7:00 PM",
      tuesday: "7:00 AM - 7:00 PM",
      wednesday: "7:00 AM - 7:00 PM",
      thursday: "7:00 AM - 7:00 PM",
      friday: "7:00 AM - 6:00 PM",
      saturday: "8:00 AM - 4:00 PM",
      sunday: "10:00 AM - 2:00 PM",
    },
    insurance: ["Blue Cross", "Aetna", "Medicare"],
  },
  {
    id: 4,
    name: "Downtown Urgent Care",
    type: "Urgent Care",
    specialty: "Urgent Care",
    address: "321 Quick St, Downtown",
    phone: "(555) 456-7890",
    email: "info@downtownurgent.com",
    website: "www.downtownurgentcare.com",
    distance: "1.2 miles",
    rating: 4.2,
    reviewCount: 423,
    networkStatus: "In-Network",
    acceptingPatients: true,
    languages: ["English", "Spanish"],
    accessibility: {
      wheelchairAccessible: true,
      parking: false,
      emergencyServices: false,
    },
    services: ["Minor Injuries", "Illness Treatment", "X-rays", "Lab Tests", "Occupational Health", "Travel Medicine"],
    hours: {
      monday: "8:00 AM - 10:00 PM",
      tuesday: "8:00 AM - 10:00 PM",
      wednesday: "8:00 AM - 10:00 PM",
      thursday: "8:00 AM - 10:00 PM",
      friday: "8:00 AM - 10:00 PM",
      saturday: "9:00 AM - 9:00 PM",
      sunday: "10:00 AM - 8:00 PM",
    },
    insurance: ["Blue Cross", "Cigna", "UnitedHealth", "Medicare"],
  },
  {
    id: 5,
    name: "Orthopedic Specialists Group",
    type: "Specialist",
    specialty: "Orthopedics",
    address: "654 Bone Dr, Medical Plaza",
    phone: "(555) 567-8901",
    email: "scheduling@orthospecialists.com",
    website: "www.orthospecialists.com",
    distance: "4.2 miles",
    rating: 4.7,
    reviewCount: 756,
    networkStatus: "Out-of-Network",
    acceptingPatients: true,
    languages: ["English"],
    accessibility: {
      wheelchairAccessible: true,
      parking: true,
      emergencyServices: false,
    },
    services: [
      "Joint Replacement",
      "Sports Medicine",
      "Spine Surgery",
      "Arthroscopy",
      "Fracture Care",
      "Physical Therapy",
    ],
    hours: {
      monday: "7:00 AM - 5:00 PM",
      tuesday: "7:00 AM - 5:00 PM",
      wednesday: "7:00 AM - 5:00 PM",
      thursday: "7:00 AM - 5:00 PM",
      friday: "7:00 AM - 4:00 PM",
      saturday: "Closed",
      sunday: "Closed",
    },
    insurance: ["Aetna", "Cigna", "Private Pay"],
  },
  {
    id: 6,
    name: "Bright Smile Dental",
    type: "Dental",
    specialty: "Dentistry",
    address: "987 Smile Ave, Dental District",
    phone: "(555) 678-9012",
    email: "appointments@brightsmile.com",
    website: "www.brightsmiledental.com",
    distance: "2.7 miles",
    rating: 4.5,
    reviewCount: 512,
    networkStatus: "In-Network",
    acceptingPatients: true,
    languages: ["English", "Spanish"],
    accessibility: {
      wheelchairAccessible: true,
      parking: true,
      emergencyServices: false,
    },
    services: [
      "General Dentistry",
      "Cosmetic Dentistry",
      "Orthodontics",
      "Oral Surgery",
      "Periodontics",
      "Endodontics",
    ],
    hours: {
      monday: "8:00 AM - 6:00 PM",
      tuesday: "8:00 AM - 6:00 PM",
      wednesday: "8:00 AM - 6:00 PM",
      thursday: "8:00 AM - 6:00 PM",
      friday: "8:00 AM - 5:00 PM",
      saturday: "9:00 AM - 3:00 PM",
      sunday: "Closed",
    },
    insurance: ["Delta Dental", "MetLife", "Cigna Dental", "Blue Cross Dental"],
  },
]

const specialtyIcons = {
  "General Practice": Stethoscope,
  Cardiology: Heart,
  Orthopedics: Bone,
  "Urgent Care": AlertCircle,
  Dentistry: Eye,
  Neurology: Brain,
}

export default function ProvidersPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedSpecialty, setSelectedSpecialty] = useState("all")
  const [selectedNetwork, setSelectedNetwork] = useState("all")
  const [sortBy, setSortBy] = useState("distance")

  // Filter providers based on search criteria
  const filteredProviders = providersData.filter((provider) => {
    const matchesSearch =
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.services.some((service) => service.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = selectedType === "all" || provider.type === selectedType
    const matchesSpecialty = selectedSpecialty === "all" || provider.specialty === selectedSpecialty
    const matchesNetwork = selectedNetwork === "all" || provider.networkStatus === selectedNetwork

    return matchesSearch && matchesType && matchesSpecialty && matchesNetwork
  })

  // Sort providers
  const sortedProviders = [...filteredProviders].sort((a, b) => {
    switch (sortBy) {
      case "distance":
        return Number.parseFloat(a.distance) - Number.parseFloat(b.distance)
      case "rating":
        return b.rating - a.rating
      case "name":
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  const getSpecialtyIcon = (specialty: string) => {
    const IconComponent = specialtyIcons[specialty as keyof typeof specialtyIcons] || Stethoscope
    return IconComponent
  }

  const getCurrentDay = () => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    return days[new Date().getDay()]
  }

  const handleBookAppointment = (providerId: number) => {
    const provider = providersData.find((p) => p.id === providerId)
    alert(
      `Booking appointment with ${provider?.name}. This would normally open a booking form or redirect to a scheduling system.`,
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Find Providers</h1>
          <p className="text-muted-foreground">Search for healthcare providers in your network</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by provider name, specialty, or services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Provider Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Hospital">Hospital</SelectItem>
                <SelectItem value="Clinic">Clinic</SelectItem>
                <SelectItem value="Specialist">Specialist</SelectItem>
                <SelectItem value="Urgent Care">Urgent Care</SelectItem>
                <SelectItem value="Dental">Dental</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                <SelectItem value="General Practice">General Practice</SelectItem>
                <SelectItem value="Cardiology">Cardiology</SelectItem>
                <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                <SelectItem value="Urgent Care">Urgent Care</SelectItem>
                <SelectItem value="Dentistry">Dentistry</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
              <SelectTrigger>
                <SelectValue placeholder="Network Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Networks</SelectItem>
                <SelectItem value="In-Network">In-Network</SelectItem>
                <SelectItem value="Out-of-Network">Out-of-Network</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {sortedProviders.length} of {providersData.length} providers
        </p>
        {(searchTerm || selectedType !== "all" || selectedSpecialty !== "all" || selectedNetwork !== "all") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("")
              setSelectedType("all")
              setSelectedSpecialty("all")
              setSelectedNetwork("all")
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Provider Cards */}
      <div className="grid gap-6">
        {sortedProviders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No providers found</h3>
              <p className="text-muted-foreground text-center">
                Try adjusting your search criteria or filters to find more providers.
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedProviders.map((provider) => {
            const SpecialtyIcon = getSpecialtyIcon(provider.specialty)

            return (
              <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <SpecialtyIcon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold">{provider.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{provider.type}</Badge>
                              <Badge variant="outline">{provider.specialty}</Badge>
                              <Badge variant={provider.networkStatus === "In-Network" ? "default" : "destructive"}>
                                {provider.networkStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="font-medium">{provider.rating}</span>
                            <span className="text-sm text-muted-foreground">({provider.reviewCount} reviews)</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{provider.distance}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{provider.address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{provider.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span>{provider.email}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>Today: {provider.hours[getCurrentDay() as keyof typeof provider.hours]}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            {provider.acceptingPatients ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-600" data-testid="check-circle" />
                                <span className="text-green-600">Accepting new patients</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 text-red-600" data-testid="alert-circle" />
                                <span className="text-red-600">Not accepting new patients</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="flex gap-1">
                              {provider.accessibility.wheelchairAccessible && (
                                <Wheelchair className="w-4 h-4 text-blue-600" title="Wheelchair Accessible" />
                              )}
                              {provider.accessibility.parking && (
                                <Car className="w-4 h-4 text-blue-600" title="Parking Available" />
                              )}
                              {provider.accessibility.emergencyServices && (
                                <AlertCircle className="w-4 h-4 text-red-600" title="Emergency Services" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Services:</p>
                        <div className="flex flex-wrap gap-1">
                          {provider.services.slice(0, 4).map((service, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                          {provider.services.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{provider.services.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:w-48">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full bg-transparent">
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-3">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <SpecialtyIcon className="w-6 h-6 text-blue-600" />
                              </div>
                              {provider.name}
                            </DialogTitle>
                            <DialogDescription>
                              {provider.type} • {provider.specialty} • {provider.networkStatus}
                            </DialogDescription>
                          </DialogHeader>

                          <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                              <TabsTrigger value="overview">Overview</TabsTrigger>
                              <TabsTrigger value="services">Services</TabsTrigger>
                              <TabsTrigger value="hours">Hours</TabsTrigger>
                              <TabsTrigger value="insurance">Insurance</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Contact Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-muted-foreground" />
                                        <span>{provider.address}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        <span>{provider.phone}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        <span>{provider.email}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-muted-foreground" />
                                        <span>{provider.website}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold mb-2">Languages</h4>
                                    <div className="flex flex-wrap gap-1">
                                      {provider.languages.map((language, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {language}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Ratings & Reviews</h4>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`w-4 h-4 ${
                                              i < Math.floor(provider.rating)
                                                ? "text-yellow-400 fill-current"
                                                : "text-gray-300"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="font-medium">{provider.rating}</span>
                                      <span className="text-sm text-muted-foreground">
                                        ({provider.reviewCount} reviews)
                                      </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">Distance: {provider.distance}</p>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold mb-2">Accessibility</h4>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 text-sm">
                                        <Wheelchair
                                          className={`w-4 h-4 ${provider.accessibility.wheelchairAccessible ? "text-green-600" : "text-gray-400"}`}
                                        />
                                        <span>Wheelchair Accessible</span>
                                        {provider.accessibility.wheelchairAccessible ? (
                                          <CheckCircle className="w-4 h-4 text-green-600" />
                                        ) : (
                                          <AlertCircle className="w-4 h-4 text-gray-400" />
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 text-sm">
                                        <Car
                                          className={`w-4 h-4 ${provider.accessibility.parking ? "text-green-600" : "text-gray-400"}`}
                                        />
                                        <span>Parking Available</span>
                                        {provider.accessibility.parking ? (
                                          <CheckCircle className="w-4 h-4 text-green-600" />
                                        ) : (
                                          <AlertCircle className="w-4 h-4 text-gray-400" />
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 text-sm">
                                        <AlertCircle
                                          className={`w-4 h-4 ${provider.accessibility.emergencyServices ? "text-green-600" : "text-gray-400"}`}
                                        />
                                        <span>Emergency Services</span>
                                        {provider.accessibility.emergencyServices ? (
                                          <CheckCircle className="w-4 h-4 text-green-600" />
                                        ) : (
                                          <AlertCircle className="w-4 h-4 text-gray-400" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Book Appointment button in modal for customers */}
                              {user?.role === "customer" && provider.acceptingPatients && (
                                <div className="pt-4 border-t">
                                  <Button className="w-full" onClick={() => handleBookAppointment(provider.id)}>
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Book Appointment
                                  </Button>
                                </div>
                              )}
                            </TabsContent>

                            <TabsContent value="services" className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-3">All Services</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {provider.services.map((service, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                      <span className="text-sm">{service}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TabsContent>

                            <TabsContent value="hours" className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-3">Operating Hours</h4>
                                <div className="space-y-2">
                                  {Object.entries(provider.hours).map(([day, hours]) => (
                                    <div
                                      key={day}
                                      className={`flex justify-between items-center p-2 rounded ${
                                        day === getCurrentDay() ? "bg-blue-50 border border-blue-200" : "border"
                                      }`}
                                    >
                                      <span className="font-medium capitalize">{day}</span>
                                      <span className={hours === "Closed" ? "text-red-600" : "text-green-600"}>
                                        {hours}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TabsContent>

                            <TabsContent value="insurance" className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-3">Accepted Insurance Plans</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {provider.insurance.map((plan, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                      <span className="text-sm">{plan}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </DialogContent>
                      </Dialog>

                      {user?.role === "customer" && provider.acceptingPatients && (
                        <Button className="w-full" onClick={() => handleBookAppointment(provider.id)}>
                          <Calendar className="w-4 h-4 mr-2" />
                          Book Appointment
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
