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

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileResponse, setTurnstileResponse] = useState('');
  const turnstileRef = useRef(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

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
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('cf-turnstile-response', turnstileResponse);

      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const responseData = await axios.post(`https://mail-sso.remala.co.id/api/login`, formData);

      if (responseData.status === 200 && responseData.data.url) {
        window.location.href = responseData.data.url;
        toast.success('Login Successfully!', {
          position: 'top-right',
        });
      }
    } catch (error) {
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
                <p>Enter your username and password to sign in!</p>
              </div>
              <div className="bottomLeft">
                <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} />
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
          2024 All Right Reserved
        </p>
      </div>
    </div>
  );
}

export default App;
