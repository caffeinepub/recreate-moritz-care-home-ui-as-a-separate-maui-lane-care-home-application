import { ResidentProfileData, ResidentMedication } from './mockResidentProfileData';

interface ResidentProfilePrintReportProps {
  resident: ResidentProfileData;
  medications: ResidentMedication[];
}

export function ResidentProfilePrintReport({
  resident,
  medications,
}: ResidentProfilePrintReportProps) {
  return (
    <div className="print-report hidden">
      {/* Report Header */}
      <div className="print-header">
        <div className="print-facility-name">Maui Lane Care Home</div>
        <div className="print-report-title">Resident Profile Report</div>
      </div>

      {/* Resident Information Section */}
      <div className="print-section">
        <h2 className="print-section-title">Resident Information</h2>
        <div className="print-section-divider"></div>
        <div className="print-info-grid">
          <div className="print-info-item">
            <span className="print-label">NAME:</span>
            <span className="print-value">{resident.name}</span>
          </div>
          <div className="print-info-item">
            <span className="print-label">RESIDENT ID:</span>
            <span className="print-value">{resident.id}</span>
          </div>
          <div className="print-info-item">
            <span className="print-label">ROOM:</span>
            <span className="print-value">{resident.room}</span>
          </div>
          <div className="print-info-item">
            <span className="print-label">DATE OF BIRTH:</span>
            <span className="print-value">{resident.dateOfBirth}</span>
          </div>
          <div className="print-info-item">
            <span className="print-label">DATE OF ADMISSION:</span>
            <span className="print-value">{resident.admissionDate}</span>
          </div>
          <div className="print-info-item">
            <span className="print-label">STATUS:</span>
            <span className="print-value">{resident.status}</span>
          </div>
        </div>
      </div>

      {/* Insurance Information Section */}
      <div className="print-section">
        <h2 className="print-section-title">Insurance Information</h2>
        <div className="print-section-divider"></div>
        <div className="print-info-grid">
          <div className="print-info-item">
            <span className="print-label">MEDICAID NUMBER:</span>
            <span className="print-value">
              {resident.medicaidNumber || 'N/A'}
            </span>
          </div>
          <div className="print-info-item">
            <span className="print-label">MEDICARE NUMBER:</span>
            <span className="print-value">
              {resident.medicareNumber || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Medications Section */}
      <div className="print-section">
        <h2 className="print-section-title">Medications</h2>
        <div className="print-section-divider"></div>
        <table className="print-medications-table">
          <thead>
            <tr>
              <th>Medication Name</th>
              <th>Dosage</th>
              <th>Route</th>
              <th>Times</th>
              <th>Prescriber</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {medications.length > 0 ? (
              medications.map((med, index) => (
                <tr key={index}>
                  <td>{med.name}</td>
                  <td>{med.dosage || '-'}</td>
                  <td>{med.route || '-'}</td>
                  <td>{med.times?.join(', ') || '-'}</td>
                  <td>{med.prescriber || '-'}</td>
                  <td>{med.notes || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="print-no-data">
                  No medications
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assigned Physicians Section */}
      <div className="print-section">
        <h2 className="print-section-title">Assigned Physicians</h2>
        <div className="print-section-divider"></div>
        <div className="print-info-grid">
          {resident.physicians.length > 0 ? (
            resident.physicians.map((physician, idx) => (
              <div key={idx} className="print-physician-block">
                <div className="print-info-item">
                  <span className="print-label">{physician.name}</span>
                </div>
                <div className="print-info-item">
                  <span className="print-label">Contact Number:</span>
                  <span className="print-value">{physician.contactNumber}</span>
                </div>
                <div className="print-info-item">
                  <span className="print-label">Specialty:</span>
                  <span className="print-value">{physician.specialty}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="print-no-data">No assigned physicians</div>
          )}
        </div>
      </div>

      {/* Pharmacy Information Section */}
      <div className="print-section">
        <h2 className="print-section-title">Pharmacy Information</h2>
        <div className="print-section-divider"></div>
        <div className="print-info-grid">
          <div className="print-info-item">
            <span className="print-label">Name:</span>
            <span className="print-value">{resident.pharmacy.name}</span>
          </div>
          <div className="print-info-item">
            <span className="print-label">Address:</span>
            <span className="print-value">{resident.pharmacy.address}</span>
          </div>
          <div className="print-info-item">
            <span className="print-label">Contact Number:</span>
            <span className="print-value">{resident.pharmacy.contactNumber}</span>
          </div>
        </div>
      </div>

      {/* Responsible Contacts Section */}
      <div className="print-section">
        <h2 className="print-section-title">Responsible Contacts</h2>
        <div className="print-section-divider"></div>
        <div className="print-info-grid">
          {resident.responsiblePersons.length > 0 ? (
            resident.responsiblePersons.map((contact, idx) => (
              <div key={idx} className="print-contact-block">
                <div className="print-info-item">
                  <span className="print-label">{contact.name}</span>
                </div>
                <div className="print-info-item">
                  <span className="print-label">Relationship:</span>
                  <span className="print-value">{contact.relationship}</span>
                </div>
                <div className="print-info-item">
                  <span className="print-label">Contact Number:</span>
                  <span className="print-value">{contact.contactNumber}</span>
                </div>
                <div className="print-info-item">
                  <span className="print-label">Address:</span>
                  <span className="print-value">{contact.address}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="print-no-data">No responsible contacts</div>
          )}
        </div>
      </div>
    </div>
  );
}
