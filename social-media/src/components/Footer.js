import React from 'react';
import { MDBFooter, MDBContainer, MDBRow, MDBCol, MDBIcon } from 'mdb-react-ui-kit';

export default function Footer() {
  return (
    <MDBFooter bgColor='dark' className='text-center text-lg-start text-white pt-4'>
      
      {/* Social Media Links */}
      <section className='d-flex justify-content-center justify-content-lg-between p-3 border-bottom'>
        <div className='me-5 d-none d-lg-block'>
          <span>Connect with us on social media:</span>
        </div>
        <div>
          <a href='#!' className='me-3 text-reset'>
            <MDBIcon fab icon='facebook-f' />
          </a>
          <a href='#!' className='me-3 text-reset'>
            <MDBIcon fab icon='twitter' />
          </a>
          <a href='#!' className='me-3 text-reset'>
            <MDBIcon fab icon='instagram' />
          </a>
          <a href='#!' className='me-3 text-reset'>
            <MDBIcon fab icon='linkedin' />
          </a>
          <a href='#!' className='me-3 text-reset'>
            <MDBIcon fab icon='youtube' />
          </a>
          <a href='#!' className='me-3 text-reset'>
            <MDBIcon fab icon='github' />
          </a>
        </div>
      </section>

      {/* Footer Content */}
      <section>
        <MDBContainer className='text-center text-md-start mt-4'>
          <MDBRow className='mt-3'>

            {/* Company Info */}
            <MDBCol md='3' lg='4' xl='3' className='mx-auto mb-4'>
              <h5 className='fw-bold text-uppercase mb-3'>SocialSphere</h5>
              <p>
                AI-powered social media management, simplifying content scheduling and engagement across multiple platforms.
              </p>
            </MDBCol>

            {/* Navigation Links */}
            <MDBCol md='3' lg='2' xl='2' className='mx-auto mb-4'>
              <h6 className='fw-bold text-uppercase mb-3'>Quick Links</h6>
              <p><a href='#!' className='text-reset text-decoration-none'>About Us</a></p>
              <p><a href='#!' className='text-reset text-decoration-none'>Features</a></p>
              <p><a href='#!' className='text-reset text-decoration-none'>Blog</a></p>
              <p><a href='#!' className='text-reset text-decoration-none'>Contact</a></p>
            </MDBCol>

            {/* Support */}
            <MDBCol md='3' lg='2' xl='2' className='mx-auto mb-4'>
              <h6 className='fw-bold text-uppercase mb-3'>Support</h6>
              <p><a href='#!' className='text-reset text-decoration-none'>Help Center</a></p>
              <p><a href='#!' className='text-reset text-decoration-none'>FAQs</a></p>
              <p><a href='#!' className='text-reset text-decoration-none'>Privacy Policy</a></p>
              <p><a href='#!' className='text-reset text-decoration-none'>Terms of Service</a></p>
            </MDBCol>

            {/* Contact Info */}
            <MDBCol md='4' lg='3' xl='3' className='mx-auto mb-md-0 mb-4'>
              <h6 className='fw-bold text-uppercase mb-3'>Contact Us</h6>
              <p>
                <MDBIcon icon='envelope' className='me-2' />
                support@socialsphere.com
              </p>
              <p>
                <MDBIcon icon='phone' className='me-2' />
                +1 (234) 567-8900
              </p>
              <p>
                <MDBIcon icon='map-marker-alt' className='me-2' />
                123 Social Media Lane, NY, USA
              </p>
            </MDBCol>

          </MDBRow>
        </MDBContainer>
      </section>

      {/* Copyright */}
      <div className='text-center p-3' style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
        © 2024 SocialSphere | All Rights Reserved
      </div>

    </MDBFooter>
  );
}
