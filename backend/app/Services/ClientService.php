<?php

namespace App\Services;

use App\Models\Client;
use App\Repositories\ClientRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ClientService
{
    public function __construct(
        protected ClientRepository $clientRepository
    ) {}

    public function listClients(?string $search): LengthAwarePaginator
    {
        return $this->clientRepository->getPaginated($search, 10);
    }

    public function getClientById(int $id): Client
    {
        return $this->clientRepository->findOrFail($id);
    }

    public function createClient(array $data): Client
    {
        return $this->clientRepository->create($data);
    }

    public function updateClient(int $id, array $data): Client
    {
        $client = $this->clientRepository->findOrFail($id);
        return $this->clientRepository->update($client, $data);
    }

    public function deleteClient(int $id): void
    {
        $client = $this->clientRepository->findOrFail($id);
        $this->clientRepository->delete($client);
    }
}
