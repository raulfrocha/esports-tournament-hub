import { Module } from '@nestjs/common';

@Module({})
export class SharedModule {}

// O SharedModule está vazio e não fornece nenhum serviço, controlador ou funcionalidade. Ele serve como um ponto de partida para adicionar recursos compartilhados entre outros módulos da aplicação. Para ser útil, normalmente você adicionaria providers, imports ou exports dentro do decorator @Module.