from django.contrib import admin
from .models import Empleado, Habitacion, Servicio, ConsumoServicio, Reserva

admin.site.register(Habitacion)
admin.site.register(Empleado)
admin.site.register(Servicio)
admin.site.register(ConsumoServicio)
admin.site.register(Reserva)