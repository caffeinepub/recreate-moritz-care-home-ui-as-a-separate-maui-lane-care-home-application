import { ResidentProfileData } from './mockResidentProfileData';
import { Medication } from './mockResidentMedications';

interface ResidentProfilePrintReportProps {
  profileData: ResidentProfileData;
  medications: Medication[];
  includeSignature: boolean;
}

export function ResidentProfilePrintReport({
  profileData,
  medications,
  includeSignature,
}: ResidentProfilePrintReportProps) {
  const activeMedications = medications.filter((med) => med.status === 'Active');
  const discontinuedMedications = medications.filter((med) => med.status === 'Discontinued');

  return (
    <div className="print-report hidden">
      {/* Report Header */}
      <div className="print-header">
        <div className="print-facility-name">Moritz Care Home</div>
        <div className="print-report-title">Resident Profile Report</div>
      </div>

      {/* Resident Information Section */}
      <div className="print-section">
        <h2 className="print-section-title">Resident Information</h2>
        <div className="print-section-divider"></div>
        <div className="print-info-grid">
          <div className="print-info-item">
            <span className="print-label">NAME:</span>
            <span className="print-value">{profileData.name}</span>
          </div>
          <div className="print-info-item">
            <span className="print-label">RESIDENT ID:</span>
            <span className="print-value">{profileData.id}</span>
          </div>
          <div className="print-info-item">
            <span className="print-label">ROOM:</span>
            <span className="print-value">{profileData.roomNumber}</span>
          </div>
          <div className="print-info-item">
            <span className="print-label">BED:</span>
            <span className="print-value">{profileData.bed}</span>
          </div>
          <div className="print-info-item">
            <span className="print-label">DATE OF BIRTH:</span>
            <span className="print-value">{profileData.dateOfBirth}</span>
          </div>
          <div className="print-info-item">
            <span className="print-label">AGE:</span>
            <span className="print-value">{profileData.age} years</span>
          </div>
          <div className="print-info-item">
            <span className="print-label">DATE OF ADMISSION:</span>
            <span className="print-value">{profileData.admissionDate}</span>
          </div>
          <div className="print-info-item">
            <span className="print-label">STATUS:</span>
            <span className="print-value">{profileData.status}</span>
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
              {profileData.insuranceInfo?.medicaidNumber || 'N/A'}
            </span>
          </div>
          <div className="print-info-item">
            <span className="print-label">MEDICARE NUMBER:</span>
            <span className="print-value">
              {profileData.insuranceInfo?.medicareNumber || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Active Medications Section */}
      <div className="print-section">
        <h2 className="print-section-title">Active Medications</h2>
        <div className="print-section-divider"></div>
        <table className="print-medications-table">
          <thead>
            <tr>
              <th>Medication Name</th>
              <th>Dosage</th>
              <th>Quantity</th>
              <th>Route</th>
              <th>Times</th>
              <th>Prescriber</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {activeMedications.length > 0 ? (
              activeMedications.map((med) => (
                <tr key={med.id}>
                  <td>{med.name}</td>
                  <td>{med.dosage}</td>
                  <td>{med.quantity}</td>
                  <td>{med.route}</td>
                  <td>{med.times}</td>
                  <td>{med.prescribedBy}</td>
                  <td>{med.notes || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="print-no-data">
                  No active medications
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Discontinued Medications Section */}
      <div className="print-section">
        <h2 className="print-section-title">Discontinued Medications</h2>
        <div className="print-section-divider"></div>
        {discontinuedMedications.length > 0 ? (
          <table className="print-medications-table">
            <thead>
              <tr>
                <th>Medication Name</th>
                <th>Dosage</th>
                <th>Quantity</th>
                <th>Route</th>
                <th>Times</th>
                <th>Prescriber</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {discontinuedMedications.map((med) => (
                <tr key={med.id}>
                  <td>{med.name}</td>
                  <td>{med.dosage}</td>
                  <td>{med.quantity}</td>
                  <td>{med.route}</td>
                  <td>{med.times}</td>
                  <td>{med.prescribedBy}</td>
                  <td>{med.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="print-no-data">No discontinued medications</div>
        )}
      </div>

      {/* Assigned Physicians Section */}
      <div className="print-section">
        <h2 className="print-section-title">Assigned Physicians</h2>
        <div className="print-section-divider"></div>
        <div className="print-info-grid">
          {profileData.assignedPhysicians.map((physician, idx) => (
            <div key={idx} className="print-physician-block">
              <div className="print-info-item">
                <span className="print-label">Sharis Arakelian - RN</span>
              </div>
              <div className="print-info-item">
                <span className="print-label">Contact Number:</span>
                <span className="print-value">{physician.phone}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pharmacy Information Section */}
      <div className="print-section">
        <h2 className="print-section-title">Pharmacy Information</h2>
        <div className="print-section-divider"></div>
        <div className="print-info-grid">
          <div className="print-info-item">
            <span className="print-label">OnePoint Patient Care</span>
          </div>
          <div className="print-info-item">
            <span className="print-label">Address:</span>
            <span className="print-value">{profileData.pharmacyInfo.address}</span>
          </div>
          <div className="print-info-item">
            <span className="print-label">Contact Number:</span>
            <span className="print-value">{profileData.pharmacyInfo.phone}</span>
          </div>
        </div>
      </div>

      {/* Responsible Contacts Section */}
      <div className="print-section">
        <h2 className="print-section-title">Responsible Contacts</h2>
        <div className="print-section-divider"></div>
        <div className="print-info-grid">
          {profileData.responsibleContacts.map((contact, idx) => (
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
                <span className="print-value">{contact.phone}</span>
              </div>
              {contact.email && (
                <div className="print-info-item">
                  <span className="print-label">Email:</span>
                  <span className="print-value">{contact.email}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Physician Signature Section (conditional) */}
      {includeSignature && (
        <div className="print-section print-signature-section">
          <div className="print-section-divider"></div>
          <div className="print-signature-block">
            <div className="print-signature-line">
              <span className="print-label">Physician Printed Name:</span>
              <span className="print-signature-underline"></span>
            </div>
            <div className="print-signature-line">
              <span className="print-label">Physician Signature:</span>
              <span className="print-signature-underline"></span>
            </div>
            <div className="print-signature-line">
              <span className="print-label">Date:</span>
              <span className="print-signature-underline-short"></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
