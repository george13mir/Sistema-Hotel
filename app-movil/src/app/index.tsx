import { useEffect, useState } from "react";
import { View, Text } from "react-native";


export default function HomeScreen(){

  const [empleados,setEmpleados] = useState<any[]>([]);


  useEffect(()=>{

    fetch("http://192.168.1.12:8000/api/empleados/")
    .then(res=>res.json())
    .then(data=>{
      setEmpleados(data);
    })
    .catch(error=>{
      console.log(error);
    });


  },[]);


  return(

    <View>

      <Text>
        Sistema Hotel
      </Text>


      {
        empleados.map((item)=>(

          <Text key={item.id}>
            {item.id} - {item.nombre} - {item.cargo}
          </Text>

        ))
      }


    </View>

  );

}