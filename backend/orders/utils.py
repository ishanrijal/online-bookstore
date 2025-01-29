from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from django.conf import settings
import os

def generate_invoice_pdf(invoice):
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Header
    p.setFont("Helvetica-Bold", 24)
    p.drawString(50, height - 50, "INVOICE")
    
    # Invoice details
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, height - 100, f"Invoice Number: {invoice.invoice_number}")
    p.drawString(50, height - 120, f"Date: {invoice.invoice_date.strftime('%Y-%m-%d')}")
    p.drawString(50, height - 140, f"Due Date: {invoice.due_date.strftime('%Y-%m-%d')}")

    # Customer details
    p.drawString(50, height - 180, "Bill To:")
    p.setFont("Helvetica", 12)
    p.drawString(50, height - 200, invoice.order.user.get_full_name())
    y = height - 220
    for line in invoice.billing_address.split('\n'):
        p.drawString(50, y, line)
        y -= 20

    # Order details
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y - 40, "Order Details:")
    
    # Table header
    y -= 60
    p.drawString(50, y, "Book")
    p.drawString(300, y, "Quantity")
    p.drawString(400, y, "Price")
    p.drawString(500, y, "Total")
    
    # Table content
    p.setFont("Helvetica", 12)
    y -= 20
    for detail in invoice.order.order_details.all():
        if y < 100:  # Start new page if near bottom
            p.showPage()
            p.setFont("Helvetica", 12)
            y = height - 50
            
        p.drawString(50, y, detail.book.title[:30])
        p.drawString(300, y, str(detail.quantity))
        p.drawString(400, y, f"${detail.book.price}")
        p.drawString(500, y, f"${detail.price}")
        y -= 20

    # Totals
    y -= 20
    p.setFont("Helvetica-Bold", 12)
    p.drawString(400, y, "Subtotal:")
    p.drawString(500, y, f"${invoice.order.total_price}")
    y -= 20
    p.drawString(400, y, "Tax:")
    p.drawString(500, y, f"${invoice.tax_amount}")
    y -= 20
    p.drawString(400, y, "Shipping:")
    p.drawString(500, y, f"${invoice.shipping_cost}")
    y -= 20
    p.drawString(400, y, "Total:")
    p.drawString(500, y, f"${invoice.total_amount}")

    # Footer
    p.setFont("Helvetica", 10)
    p.drawString(50, 50, "Thank you for your business!")
    
    p.showPage()
    p.save()
    buffer.seek(0)
    
    # Save PDF to invoice model
    filename = f'invoice_{invoice.invoice_number}.pdf'
    invoice.pdf_file.save(filename, buffer, save=True)
    
    return buffer