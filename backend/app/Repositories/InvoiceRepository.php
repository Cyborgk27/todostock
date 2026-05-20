<?php

namespace App\Repositories;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class InvoiceRepository
{
    public function getPaginated(?string $search, int $perPage = 10): LengthAwarePaginator
    {
        return Invoice::with('client')
            ->when($search, function ($query, $search) {
                $query->where('invoice_number', 'ilike', "%{$search}%")
                      ->orWhereHas('client', function ($q) use ($search) {
                          $q->where('name', 'ilike', "%{$search}%")
                            ->orWhere('identification', 'like', "%{$search}%");
                      });
            })
            ->orderBy('id', 'desc')
            ->paginate($perPage);
    }

    public function findOrFail(int $id): Invoice
    {
        return Invoice::with(['client', 'items.product'])->findOrFail($id);
    }

    public function getNextInvoiceNumber(): string
    {
        $lastInvoice = Invoice::orderBy('id', 'desc')->first();
        $nextId = $lastInvoice ? $lastInvoice->id + 1 : 1;
        return 'FAC-' . str_pad($nextId, 6, '0', STR_PAD_LEFT);
    }

    public function createHeader(array $data): Invoice
    {
        return Invoice::create($data);
    }

    public function createItem(array $data): InvoiceItem
    {
        return InvoiceItem::create($data);
    }

    public function updateHeaderTotals(Invoice $invoice, array $totals): Invoice
    {
        $invoice->update($totals);
        return $invoice;
    }
}
