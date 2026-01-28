package Retail.POS.exceptions;

public class InsufficientStockException extends RuntimeException {

    public InsufficientStockException() {
        super("Insufficient stock available");
    }

    public InsufficientStockException(String message) {
        super(message);
    }
}
