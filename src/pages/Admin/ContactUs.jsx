import React,{useState,useEffect} from 'react'
import axios from 'axios';
import { Heading, ContactComponent, Loader } from '../../components';
import {userImg} from "../../images";
import {toast} from "react-hot-toast";
import {BASE_URL} from "../../utils/fetchData";
const ContactUs = () => {
  const [contact, setContact] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAllContact= async () => {
    try {
      // const res = await axios.get("http://localhost:5000/api/v1/contact/getall-contact");
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/v1/contact/getall-contact`);
      if (res.data && res.data.success) {
        console.log(res.data);
        setContact(res.data.contact);
      }
      setLoading(false);
    }
    catch (err) {
      console.log(err);
      toast.error("something went wong in getting all contact");
      setLoading(false);
    }
  }

  useEffect(() => {
    getAllContact();
  }, []);

  if(loading){
    return <Loader/>
  }
  
  return (
    <section className='bg-gray-900 min-h-screen'>
      <div className="container mx-auto px-4 pt-20 pb-10">
        <div className="mb-6">
          <Heading name="Query List" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {contact.map((query, index) => (
            <ContactComponent 
              key={query._id || index}
              userImg={userImg} 
              name={query.name} 
              email={query.email} 
              city={query.city} 
              phone={query.phone} 
              message={query.message} 
              i={query._id} 
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ContactUs;