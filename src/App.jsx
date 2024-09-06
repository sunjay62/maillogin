import React, { useEffect, useRef, useState } from 'react';
import './App.scss';
import logoRemala from './assets/image/logoremala.png';
import logoTachyon from './assets/image/logotachyon.png';
import logoNethome from './assets/image/logonethome.png';
import logoFmi from './assets/image/logofmi.png';
import logoJfi from './assets/image/logojfi.png';
import logoAccelworks from './assets/image/logoaccelworks.png';
import logoPc24 from './assets/image/logopc24.png';
import logoSaas from './assets/image/logosaas.png';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Modal, Input, Button } from 'antd';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileResponse, setTurnstileResponse] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const turnstileRef = useRef(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const urlEndpoint = window.location.hostname;
  console.log(urlEndpoint);

  useEffect(() => {
    if (!isScriptLoaded && !document.getElementById('turnstile-script')) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback';
      script.id = 'turnstile-script';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        setIsScriptLoaded(true);
      };

      document.body.appendChild(script);

      window.onloadTurnstileCallback = function () {
        if (turnstileRef.current && !turnstileRef.current.hasChildNodes()) {
          window.turnstile.render(turnstileRef.current, {
            sitekey: '0x4AAAAAAAhYlX5ZsZV7ns1O',
            callback: function (token) {
              setTurnstileResponse(token);
            },
          });
        }
      };

      return () => {
        const scriptElement = document.getElementById('turnstile-script');
        if (scriptElement) {
          document.body.removeChild(scriptElement);
        }
      };
    }
  }, [isScriptLoaded]);

  const handleLogin = async () => {
    // Reset error messages
    setEmailError('');
    setPasswordError('');

    // Validate email and password
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('cf-turnstile-response', turnstileResponse);

      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const apiEndpoint = `https://${urlEndpoint}/api/login`;
      console.log('API Endpoint for axios.post:', apiEndpoint);

      const responseData = await axios.post(apiEndpoint, formData);

      // console.log(responseData);

      if (responseData.status === 200 && responseData.data.url) {
        window.location.href = responseData.data.url;
        toast.success('Login Successfully!', {
          position: 'top-right',
        });
      } else if (responseData.status === 200 && responseData.data.change_pass) {
        setIsModalVisible(true); // Show the modal if change_pass is true
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 401) {
        toast.error(error.response.data.messages, {
          position: 'top-center',
        });
      } else if (error.response && error.response.status === 500) {
        toast.error(error.message, {
          position: 'top-center',
        });
      }
    }
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('New Password must be at least 8 characters long.');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('New Password must contain at least one uppercase letter.');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('New Password must contain at least one number.');
    }
    if (!/[!@#$%^]/.test(password)) {
      errors.push('New Password must contain at least one special character (!@#$%^&*).');
    }
    return errors;
  };

  const handlePasswordChange = async () => {
    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match', {
        position: 'top-center',
      });
      return;
    }

    // Validate new password
    const validationErrors = validatePassword(newPassword);
    if (validationErrors.length > 0) {
      // Add numbering to each error message and include a <br /> tag for new line
      const numberedErrors = validationErrors.map((error, index) => `${index + 1}. ${error}`).join('<br />');

      toast.error(<div dangerouslySetInnerHTML={{ __html: numberedErrors }} />, {
        position: 'top-center',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('old_password', password);
      formData.append('new_password', confirmPassword);
      formData.append('cf-turnstile-response', turnstileResponse);

      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const apiChangePassword = `https://${urlEndpoint}/api/changepass`;
      console.log('API Endpoint for axios.post:', apiChangePassword);

      const responseData = await axios.post(apiChangePassword, formData);

      // console.log(responseData);

      if (responseData.status === 200 && responseData.data.url) {
        window.location.href = responseData.data.url;
        toast.success('Login Successfully!', {
          position: 'top-right',
        });
      } else if (responseData.status === 200 && responseData.data.change_pass) {
        setIsModalVisible(true); // Show the modal if change_pass is true
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 401) {
        toast.error(error.response.data.messages, {
          position: 'top-center',
        });
      } else if (error.response && error.response.status === 500) {
        toast.error(error.message, {
          position: 'top-center',
        });
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="mainContainer">
      <div className="loginContainer">
        <div className="mobileLogoTop">
          <img src={logoRemala} alt="Remala Abadi" />
        </div>
        <div className="loginLeft">
          <div className="borderLogin">
            <div className="loginContent">
              <div className="topLeft">
                <h1>Sign In Email</h1>
                <p>Enter your email and password to sign in!</p>
              </div>
              <div className="bottomLeft">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  onKeyDown={handleKeyDown}
                  required
                  className={emailError ? 'error-input' : ''}
                />
                {emailError && <span className="error">{emailError}</span>}

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  onKeyDown={handleKeyDown}
                  required
                  className={passwordError ? 'error-input' : ''}
                />
                {passwordError && <span className="error">{passwordError}</span>}
                <div id="turnstile-container" ref={turnstileRef}></div>
                <button onClick={handleLogin}>Sign In</button>
              </div>
            </div>
          </div>
        </div>
        <div className="mobileLogoBottom">
          <img src={logoTachyon} alt="Tachyon" />
          <img src={logoFmi} alt="FMI" />
          <img src={logoNethome} alt="Nethome" />
          <img src={logoPc24} alt="PC24" />
          <img src={logoSaas} alt="SaaS" />
          <img src={logoAccelworks} alt="Accelworks" />
          <img src={logoJfi} alt="JFI" />
        </div>
        <hr />
        <div className="loginRight">
          <div className="borderLogo">
            <div className="logoTop">
              <img src={logoRemala} alt="Remala Abadi" />
            </div>
            <div className="logoBottom">
              <img src={logoTachyon} alt="Tachyon" />
              <img src={logoFmi} alt="FMI" />
              <img src={logoNethome} alt="Nethome" />
              <img src={logoPc24} alt="PC24" />
              <img src={logoSaas} alt="SaaS" />
              <img src={logoAccelworks} alt="Accelworks" />
              <img src={logoJfi} alt="JFI" />
            </div>
          </div>
        </div>
      </div>
      <div className="creditContainer">
        <p>
          Copyright ©{' '}
          <a href="https://remala.id/" target="_blank" className="linkRemala">
            Remala Group
          </a>{' '}
          All Rights Reserved
        </p>
      </div>

      <Modal title="Change Password" className="modalContainer" open={isModalVisible} onOk={handlePasswordChange} onCancel={handleCancel}>
        <div className="modalTop">
          <p>Note: The new password must consist of at least 8 characters, including 1 uppercase letter, 1 number, and 1 special character (!@#$%^&*).</p>
        </div>

        <p>Current Password</p>
        <Input.Password className="changePassword" placeholder="Current Password" value={password} onChange={(e) => setCurrentPassword(e.target.value)} />
        <p>New Password</p>
        <Input.Password className="changePassword" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <p>Confirm New Password</p>
        <Input.Password className="changePassword" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      </Modal>
    </div>
  );
}

export default App;
