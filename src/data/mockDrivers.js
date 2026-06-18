/**
 * MOCK DATA — ShuttleLog Halifax
 * Airtable Base: ParkNFly_Halifax
 * Table: Drivers
 * Replace this file with: useFetchDrivers() hook → Airtable API
 *
 * AIRTABLE: Replace with → GET /Drivers table
 * Fields: Driver_ID, Full_Name, Initials, Status, Employee_ID
 */

export const mockDrivers = [
  { id: 'D001', name: 'Mike Hennigar', initials: 'MH', status: 'active', employeeId: 'EMP-041' },
  { id: 'D002', name: 'Sandra LeBlanc', initials: 'SL', status: 'active', employeeId: 'EMP-023' },
  { id: 'D003', name: 'Terry Walsh', initials: 'TW', status: 'active', employeeId: 'EMP-067' },
  { id: 'D004', name: 'Donna MacIsaac', initials: 'DM', status: 'active', employeeId: 'EMP-019' },
  { id: 'D005', name: 'Roy Boutilier', initials: 'RB', status: 'active', employeeId: 'EMP-088' },
  { id: 'D006', name: 'Janet Chisholm', initials: 'JC', status: 'on-leave', employeeId: 'EMP-034' },
]

export const getDriverById = (id) => mockDrivers.find((d) => d.id === id)
export const getDriverName = (id) => getDriverById(id)?.name ?? 'Unknown Driver'

export default mockDrivers
