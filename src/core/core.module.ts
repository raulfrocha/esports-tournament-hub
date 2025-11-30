import { Module } from '@nestjs/common';

@Module({})
export class CoreModule {}

// O CoreModule está vazio e não fornece nenhum serviço, controlador ou funcionalidade. Ele serve como um ponto de partida para adicionar funcionalidades centrais da aplicação. Para ser útil, normalmente você adicionaria providers, imports ou exports dentro do decorator @Module.