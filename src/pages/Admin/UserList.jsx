import { useState, useEffect } from 'react';
import { Heading, User, Loader } from '../../components';
import axios from 'axios';
import {toast} from "react-hot-toast";
import {userImg} from "../../images";
import { BASE_URL } from '../../utils/fetchData';
const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const getAllUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/v1/auth/get-all-users`);
      if (res.data && res.data.success) {
        console.log(res.data.users);
        setUsers(res.data.users);
      }
      setLoading(false); 
    }
    catch (err) {
      console.log(err);
      toast.error("something went wong in getting all users || internet issue");
      setLoading(false);
    }
  }

  useEffect(() => {
    getAllUsers();
  }, []);


  if(loading){
    return <Loader/>
  }

  return (
    <section className='bg-gray-900 min-h-screen'>
      <div className="container mx-auto px-4 pt-20 pb-10">
        <div className="mb-6">
          <Heading name="User List" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user, index) => (
            <User 
              key={user._id || index}
              userImg={userImg} 
              name={user.name} 
              email={user.email} 
              contact={user.contact} 
              city={user.city} 
              i={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default UserList;